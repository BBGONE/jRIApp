using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using RIAPP.DataService.DomainService.Attributes;
using RIAPP.DataService.DomainService.Exceptions;
using RIAPP.DataService.DomainService.Interfaces;
using RIAPP.DataService.DomainService.Types;
using RIAPP.DataService.Utils.Extensions;

namespace RIAPP.DataService.Utils.CodeGen
{
    public class TypeScriptHelper
    {
        private readonly List<Type> _clientTypes;
        private DotNet2TS _dotNet2TS;
        private readonly MetadataResult _metadata;
        private readonly ILookup<Type, MethodDescription> _queriesLookup;
        private readonly StringBuilder _sb = new StringBuilder(4096);
        private readonly IServiceContainer _serviceContainer;

        public TypeScriptHelper(IServiceContainer serviceContainer, MetadataResult metadata,
            IEnumerable<Type> clientTypes)
        {
            if (serviceContainer == null)
                throw new ArgumentException("converter parameter must not be null", "serviceContainer");
            _serviceContainer = serviceContainer;
            if (metadata == null)
                throw new ArgumentException("metadata parameter must not be null", "metadata");
            _metadata = metadata;
            _clientTypes = new List<Type>(clientTypes == null ? Enumerable.Empty<Type>() : clientTypes);
            _queriesLookup = _metadata.methods.Where(m => m.isQuery).ToLookup(m => m.methodData.entityType);
        }

        private void _dotnet2TS_newClientTypeAdded(object sender, NewTypeArgs e)
        {
            if (!_clientTypes.Contains(e.t))
            {
                _clientTypes.Add(e.t);
            }
        }

        private void WriteString(string str)
        {
            _sb.Append(str);
        }

        private void WriteStringLine(string str)
        {
            _sb.AppendLine(str);
        }

        private void WriteLine()
        {
            _sb.AppendLine();
        }

        private static void addComment(StringBuilder sb, string comment)
        {
            sb.AppendLine(@"/*");
            sb.AppendLine(comment);
            sb.AppendLine("*/");
            sb.AppendLine();
        }

        public string CreateTypeScript(string comment = null)
        {
            if (_dotNet2TS != null)
            {
                _dotNet2TS.newClientTypeAdded -= _dotnet2TS_newClientTypeAdded;
            }
            _dotNet2TS = new DotNet2TS(_serviceContainer);
            _dotNet2TS.newClientTypeAdded += _dotnet2TS_newClientTypeAdded;
            _sb.Length = 0;
            if (!string.IsNullOrWhiteSpace(comment))
            {
                addComment(_sb, comment);
            }
            WriteStringLine(createHeader());
            WriteLine();

            processMethodArgs();
            var isvcMethods = createISvcMethods();

            //create typed Lists and Dictionaries
            var listTypes = createClientTypes();
            //get interface declarations for all client types
            var sbInterfaceDefs = _dotNet2TS.GetInterfaceDeclarations();

            if (!string.IsNullOrWhiteSpace(sbInterfaceDefs))
            {
                WriteStringLine(@"//******BEGIN INTERFACE REGION******");
                WriteStringLine(sbInterfaceDefs);
                WriteStringLine(@"//******END INTERFACE REGION******");
                WriteLine();
            }
            if (!string.IsNullOrWhiteSpace(isvcMethods))
            {
                WriteStringLine(isvcMethods);
                WriteLine();
            }
            if (!string.IsNullOrWhiteSpace(listTypes))
            {
                WriteStringLine(@"//******BEGIN LISTS REGION******");
                WriteStringLine(listTypes);
                WriteStringLine(@"//******END LISTS REGION******");
                WriteLine();
            }

            //this.WriteStringLine(this.createQueryNames());

            var ctbuilder = new ComplexTypeBuilder(_dotNet2TS);
            _metadata.dbSets.ForEach(dbSetInfo =>
            {
                dbSetInfo.fieldInfos.ForEach(fieldInfo =>
                {
                    if (fieldInfo.fieldType == FieldType.Object)
                    {
                        ctbuilder.CreateComplexType(dbSetInfo, fieldInfo, 0);
                    }
                });
            });

            var complexTypes = ctbuilder.GetComplexTypes();
            if (!string.IsNullOrWhiteSpace(complexTypes))
            {
                WriteStringLine(@"//******BEGIN COMPLEX TYPES REGION*****");
                WriteStringLine(complexTypes);
                WriteStringLine(@"//******END COMPLEX TYPES REGION******");
                WriteLine();
            }

            _metadata.dbSets.ForEach(dbSetInfo =>
            {
                WriteStringLine(createEntityType(dbSetInfo));
                WriteLine();
                WriteStringLine(createDbSetType(dbSetInfo));
                WriteLine();
            });

            WriteStringLine(createIAssocs());
            WriteLine();
            WriteStringLine(createDbContextType());
            WriteLine();
            return _sb.ToString();
        }

        private string createHeader()
        {
            var sbResult = new StringBuilder(512);

            new TemplateParser("Header.txt").ProcessParts(part =>
            {
                if (!part.isPlaceHolder)
                {
                    sbResult.Append(part.value);
                }
            });

            return sbResult.ToString();
        }

        private string createDbSetProps()
        {
            var sb = new StringBuilder(512);
            _metadata.dbSets.ForEach(dbSetInfo =>
            {
                var dbSetType = GetDbSetTypeName(dbSetInfo.dbSetName);
                sb.AppendFormat("\tget {0}() {{ return <{1}>this.getDbSet(\"{0}\"); }}", dbSetInfo.dbSetName, dbSetType);
                sb.AppendLine();
            });
            return sb.ToString();
        }

        private string createIAssocs()
        {
            var sb = new StringBuilder(512);
            sb.AppendLine("export interface IAssocs");
            sb.AppendLine("{");
            _metadata.associations.ForEach(assoc =>
            {
                sb.AppendFormat("\tget{0}: {1};", assoc.name, "()=> dbMOD.Association");
                sb.AppendLine();
            });
            sb.AppendLine("}");
            return sb.ToString();
        }

        private string _CreateParamSignature(ParamMetadata paramInfo)
        {
            return string.Format("{0}{1}: {2}{3};", paramInfo.name, paramInfo.isNullable ? "?" : "",
                paramInfo.dataType == DataType.None
                    ? _dotNet2TS.GetTSTypeName(paramInfo.ParameterType)
                    : DotNet2TS.GetTSTypeNameFromDataType(paramInfo.dataType),
                paramInfo.dataType != DataType.None && paramInfo.isArray ? "[]" : "");
        }

        private void processMethodArgs()
        {
            _metadata.methods.ForEach(methodInfo =>
            {
                if (methodInfo.parameters.Count() > 0)
                {
                    methodInfo.parameters.ForEach(paramInfo =>
                    {
                        //if this is complex type parse parameter to create its typescript interface
                        if (paramInfo.dataType == DataType.None)
                            _dotNet2TS.GetTSTypeName(paramInfo.ParameterType);
                    });
                }
            });
        }

        private string createISvcMethods()
        {
            var sbISvcMeth = new StringBuilder(512);
            sbISvcMeth.AppendLine("export interface ISvcMethods");
            sbISvcMeth.AppendLine("{");
            var sbArgs = new StringBuilder(255);
            var svcMethods = _metadata.methods.Where(m => !m.isQuery).ToList();
            svcMethods.ForEach(methodInfo =>
            {
                sbArgs.Length = 0;
                if (methodInfo.parameters.Count() > 0)
                {
                    sbArgs.AppendLine("(args: {");
                    methodInfo.parameters.ForEach(paramInfo =>
                    {
                        sbArgs.Append("\t\t");
                        sbArgs.AppendFormat(_CreateParamSignature(paramInfo));
                        sbArgs.AppendLine();
                    });
                    if (methodInfo.methodResult)
                    {
                        sbArgs.Append("\t}) => RIAPP.IPromise<");
                        sbArgs.Append(
                            _dotNet2TS.GetTSTypeName(
                                MetadataHelper.RemoveTaskFromType(methodInfo.methodData.methodInfo.ReturnType)));
                        sbArgs.Append(">");
                    }
                    else
                    {
                        sbArgs.Append("\t}) => RIAPP.IVoidPromise");
                    }
                }
                else
                {
                    if (methodInfo.methodResult)
                    {
                        sbArgs.Append("() => RIAPP.IPromise<");
                        sbArgs.Append(_dotNet2TS.GetTSTypeName(methodInfo.methodData.methodInfo.ReturnType));
                        sbArgs.Append(">");
                    }
                    else
                    {
                        sbArgs.Append("() => RIAPP.IVoidPromise");
                    }
                }

                sbISvcMeth.AppendFormat("\t{0}: {1};", methodInfo.methodName, sbArgs.ToString());
                sbISvcMeth.AppendLine();
            });

            sbISvcMeth.AppendLine("}");
            return sbISvcMeth.ToString().TrimEnd('\r', '\n');
        }

        private string createClientTypes()
        {
            var sb = new StringBuilder(1024);
            for (var i = 0; i < _clientTypes.Count(); ++i)
            {
                var type = _clientTypes[i];
                sb.Append(createClientType(type));
            }

            return sb.ToString().TrimEnd('\r', '\n');
        }

        private string createDictionary(string name, string keyName, string itemName, string aspectName,
            string interfaceName, string properties, List<PropertyInfo> propList)
        {
            var sbDict = new StringBuilder(512);
            var pkProp = propList.Where(propInfo => keyName == propInfo.Name).SingleOrDefault();
            if (pkProp == null)
                throw new Exception(string.Format("Dictionary item does not have a property with a name {0}", keyName));
            var pkVals = pkProp.Name.toCamelCase() + ": " + _dotNet2TS.GetTSTypeName(pkProp.PropertyType);


            new TemplateParser("Dictionary.txt").ProcessParts(part =>
            {
                if (!part.isPlaceHolder)
                {
                    sbDict.Append(part.value);
                }
                else
                {
                    switch (part.value)
                    {
                        case "DICT_NAME":
                            sbDict.Append(name);
                            break;
                        case "ITEM_TYPE_NAME":
                            sbDict.Append(itemName);
                            break;
                        case "INTERFACE_NAME":
                            sbDict.Append(interfaceName);
                            break;
                        case "ASPECT_NAME":
                            sbDict.Append(aspectName);
                            break;
                        case "KEY_NAME":
                            sbDict.Append(keyName);
                            break;
                        case "PROPS":
                        {
                            sbDict.Append(properties);
                        }
                            break;
                        case "PK_VALS":
                            sbDict.Append(pkVals);
                            break;
                    }
                }
            });
            return sbDict.ToString();
        }

        private string createList(string name, string itemName, string aspectName, string interfaceName,
            string properties)
        {
            var sbList = new StringBuilder(512);

            new TemplateParser("List.txt").ProcessParts(part =>
            {
                if (!part.isPlaceHolder)
                {
                    sbList.Append(part.value);
                }
                else
                {
                    switch (part.value)
                    {
                        case "LIST_NAME":
                            sbList.Append(name);
                            break;
                        case "ITEM_TYPE_NAME":
                            sbList.Append(itemName);
                            break;
                        case "INTERFACE_NAME":
                            sbList.Append(interfaceName);
                            break;
                        case "ASPECT_NAME":
                            sbList.Append(aspectName);
                            break;
                        case "PROP_INFOS":
                        {
                            sbList.Append(properties);
                        }
                            break;
                    }
                }
            });

            return sbList.ToString();
        }

        private string createListItem(string itemName, string aspectName, string interfaceName,
            List<PropertyInfo> propInfos)
        {
            var sbProps = new StringBuilder(512);
            propInfos.ForEach(propInfo =>
            {
                sbProps.AppendLine(string.Format("\tget {0}():{1} {{ return <{1}>this._aspect._getProp('{0}'); }}",
                    propInfo.Name, _dotNet2TS.GetTSTypeName(propInfo.PropertyType)));
                sbProps.AppendLine(string.Format("\tset {0}(v:{1}) {{ this._aspect._setProp('{0}', v); }}",
                    propInfo.Name, _dotNet2TS.GetTSTypeName(propInfo.PropertyType)));
            });

            var sbListItem = new StringBuilder(512);

            new TemplateParser("ListItem.txt").ProcessParts(part =>
            {
                if (!part.isPlaceHolder)
                {
                    sbListItem.Append(part.value);
                }
                else
                {
                    switch (part.value)
                    {
                        case "LIST_ITEM_NAME":
                            sbListItem.Append(itemName);
                            break;
                        case "INTERFACE_NAME":
                            sbListItem.Append(interfaceName);
                            break;
                        case "ASPECT_NAME":
                            sbListItem.Append(aspectName);
                            break;
                        case "ITEM_PROPS":
                        {
                            sbListItem.Append(sbProps.ToString());
                        }
                            break;
                    }
                }
            });

            sbListItem.AppendLine();
            return sbListItem.ToString();
        }

        private string createClientType(Type type)
        {
            var dictAttr =
                type.GetCustomAttributes(typeof(DictionaryAttribute), false)
                    .OfType<DictionaryAttribute>()
                    .FirstOrDefault();
            var listAttr =
                type.GetCustomAttributes(typeof(ListAttribute), false).OfType<ListAttribute>().FirstOrDefault();

            if (dictAttr != null && dictAttr.KeyName == null)
                throw new ArgumentException("DictionaryAttribute KeyName property must not be null");
            var sb = new StringBuilder(512);
            string dictName = null;
            string listName = null;
            if (dictAttr != null)
                dictName = dictAttr.DictionaryName == null
                    ? string.Format("{0}Dict", type.Name)
                    : dictAttr.DictionaryName;
            if (listAttr != null)
                listName = listAttr.ListName == null ? string.Format("{0}List", type.Name) : listAttr.ListName;
            var isListItem = dictAttr != null || listAttr != null;
            var interfaceName = _dotNet2TS.GetTSTypeName(type);

            //can return here if no need to create Dictionary or List
            if (!type.IsClass || !isListItem)
                return sb.ToString();

            var listItemName = string.Format("{0}ListItem", type.Name);
            var itemAspectName = string.Format("{0}Aspect", listItemName);
            var propInfos = type.GetProperties().ToList();
            var list_properties = string.Empty;

            #region Define fn_Properties

            Func<List<PropertyInfo>, string> fn_Properties = props =>
            {
                var sbProps = new StringBuilder(256);

                sbProps.Append("[");
                var isFirst = true;
                var isArray = false;

                props.ForEach(propInfo =>
                {
                    if (!isFirst)
                        sbProps.Append(",");
                    var dataType = DataType.None;
                    try
                    {
                        dataType = _dotNet2TS.DataTypeFromDotNetType(propInfo.PropertyType, out isArray);
                        if (isArray)
                            dataType = DataType.None;
                    }
                    catch (UnsupportedTypeException)
                    {
                        dataType = DataType.None;
                    }
                    sbProps.Append("{");
                    sbProps.Append(string.Format("name:'{0}',dtype:{1}", propInfo.Name, (int) dataType));
                    sbProps.Append("}");
                    isFirst = false;
                });
                sbProps.Append("]");
                return sbProps.ToString();
            };

            #endregion

            if (dictAttr != null || listAttr != null)
            {
                var listItem = createListItem(listItemName, itemAspectName, interfaceName, propInfos);
                sb.AppendLine(listItem);

                list_properties = fn_Properties(propInfos);
            }

            if (dictAttr != null)
            {
                sb.AppendLine(createDictionary(dictName, dictAttr.KeyName, listItemName, itemAspectName, interfaceName,
                    list_properties, propInfos));
                sb.AppendLine();
            }

            if (listAttr != null)
            {
                sb.AppendLine(createList(listName, listItemName, itemAspectName, interfaceName, list_properties));
                sb.AppendLine();
            }


            return sb.ToString();
        }

        /*
        private string createQueryNames()
        {
            var sb = new StringBuilder(256);
            sb.AppendLine("export var QUERY_NAME =");
            sb.Append("{");
            bool isFirst = true;
            this._metadata.methods.ForEach((methodInfo) =>
            {
                if (methodInfo.isQuery)
                {
                    if (!isFirst)
                    {
                        sb.Append(",");
                        sb.AppendLine();
                    }
                    sb.AppendFormat("\t{0}: '{0}'", methodInfo.methodName);
                  
                    isFirst = false;
                }
            });
            sb.AppendLine();
            sb.AppendLine("};");
            return sb.ToString();
        }
        */

        private string createDbSetQueries(DbSetInfo dbSetInfo)
        {
            var sb = new StringBuilder(256);
            var sbArgs = new StringBuilder(256);
            var queries = _queriesLookup[dbSetInfo.EntityType].ToList();
            queries.ForEach(methodDescription =>
            {
                sbArgs.Length = 0;
                sbArgs.AppendLine("args?: {");
                var cnt = 0;
                methodDescription.parameters.ForEach(paramInfo =>
                {
                    sbArgs.Append("\t\t");
                    sbArgs.AppendFormat(_CreateParamSignature(paramInfo));
                    sbArgs.AppendLine();
                    ++cnt;
                });
                sbArgs.Append("\t}");
                if (cnt == 0)
                {
                    sbArgs.Length = 0;
                }
                sb.AppendFormat("\tcreate{0}Query({1})", methodDescription.methodName, sbArgs.ToString());
                sb.AppendLine();
                sb.Append("\t{");
                sb.AppendLine();
                if (sbArgs.Length > 0)
                {
                    sb.AppendFormat("\t\tvar query = this.createQuery('{0}');", methodDescription.methodName);
                    sb.AppendLine();
                    sb.AppendLine("\t\tquery.params = args;");
                    sb.AppendLine("\t\treturn query;");
                }
                else
                {
                    sb.AppendFormat("\t\treturn this.createQuery('{0}');", methodDescription.methodName);
                    sb.AppendLine();
                }
                sb.AppendLine("\t}");
            });
            return sb.ToString();
        }

        private string createCalcFields(DbSetInfo dbSetInfo)
        {
            var entityType = GetEntityTypeName(dbSetInfo.dbSetName);
            var sb = new StringBuilder(256);
            dbSetInfo.fieldInfos.ForEach(fieldInfo =>
            {
                _serviceContainer.DataHelper.ForEachFieldInfo("", fieldInfo, (fullName, f) =>
                {
                    if (f.fieldType == FieldType.Calculated)
                    {
                        sb.AppendFormat("\tdefine{0}Field(getFunc: (item: {1}) => {2})", fullName.Replace('.', '_'),
                            entityType, GetFieldDataType(f));
                        sb.Append(" { ");
                        sb.AppendFormat("this._defineCalculatedField('{0}', getFunc);", fullName);
                        sb.Append(" }");
                        sb.AppendLine();
                    }
                });
            });
            return sb.ToString();
        }

        private string createDbContextType()
        {
            var sb = new StringBuilder(512);
            var dbSetNames = _metadata.dbSets.Select(d => d.dbSetName).ToArray();
            var sbCreateDbSets = new StringBuilder(512);
            _metadata.dbSets.ForEach(dbSetInfo =>
            {
                var dbSetType = GetDbSetTypeName(dbSetInfo.dbSetName);
                sbCreateDbSets.AppendFormat("\t\tthis._createDbSet(\"{0}\",{1});", dbSetInfo.dbSetName, dbSetType);
                sbCreateDbSets.AppendLine();
            });

            new TemplateParser("DbContext.txt").ProcessParts(part =>
            {
                if (!part.isPlaceHolder)
                {
                    sb.Append(part.value);
                }
                else
                {
                    switch (part.value)
                    {
                        case "DBSETS_NAMES":
                            sb.Append(_serviceContainer.Serializer.Serialize(dbSetNames));
                            break;
                        case "DBSETS_PROPS":
                            sb.Append(createDbSetProps());
                            break;
                        case "DBSETS":
                            sb.Append(sbCreateDbSets);
                            break;
                        case "TIMEZONE":
                            sb.Append(_metadata.serverTimezone.ToString());
                            break;
                        case "ASSOCIATIONS":
                            sb.Append(_serviceContainer.Serializer.Serialize(_metadata.associations));
                            break;
                        case "METHODS":
                            sb.Append(_serviceContainer.Serializer.Serialize(_metadata.methods));
                            break;
                    }
                }
            });
            return sb.ToString();
        }

        private string createDbSetType(DbSetInfo dbSetInfo)
        {
            var sb = new StringBuilder(512);
            var dbSetType = GetDbSetTypeName(dbSetInfo.dbSetName);
            var entityName = GetEntityName(dbSetInfo.dbSetName);
            var entityType = GetEntityTypeName(dbSetInfo.dbSetName);
            var entityInterfaceName = GetEntityInterfaceName(dbSetInfo.dbSetName);
            var childAssoc = _metadata.associations.Where(assoc => assoc.childDbSetName == dbSetInfo.dbSetName).ToList();
            var parentAssoc =
                _metadata.associations.Where(assoc => assoc.parentDbSetName == dbSetInfo.dbSetName).ToList();
            var fieldInfos = dbSetInfo.fieldInfos;

            var pkFields = dbSetInfo.GetPKFields();
            var pkVals = "";
            foreach (var pkField in pkFields)
            {
                if (!string.IsNullOrEmpty(pkVals))
                    pkVals += ", ";
                pkVals += pkField.fieldName.toCamelCase() + ": " + GetFieldDataType(pkField);
            }

            new TemplateParser("DbSet.txt").ProcessParts(part =>
            {
                if (!part.isPlaceHolder)
                {
                    sb.Append(part.value);
                }
                else
                {
                    switch (part.value)
                    {
                        case "DBSET_NAME":
                            sb.Append(dbSetInfo.dbSetName);
                            break;
                        case "DBSET_TYPE":
                            sb.Append(dbSetType);
                            break;
                        case "ENTITY_NAME":
                            sb.Append(entityName);
                            break;
                        case "ENTITY_TYPE":
                            sb.Append(entityType);
                            break;
                        case "ENTITY_INTERFACE":
                        {
                            sb.Append(entityInterfaceName);
                        }
                            break;
                        case "DBSET_INFO":
                        {
                            dbSetInfo._fieldInfos = null;
                            sb.Append(_serviceContainer.Serializer.Serialize(dbSetInfo));
                            dbSetInfo._fieldInfos = fieldInfos;
                        }
                            break;
                        case "FIELD_INFOS":
                        {
                            sb.Append(_serviceContainer.Serializer.Serialize(dbSetInfo.fieldInfos));
                        }
                            break;
                        case "CHILD_ASSOC":
                            sb.Append(_serviceContainer.Serializer.Serialize(childAssoc));
                            break;
                        case "PARENT_ASSOC":
                            sb.Append(_serviceContainer.Serializer.Serialize(parentAssoc));
                            break;
                        case "QUERIES":
                            sb.Append(createDbSetQueries(dbSetInfo));
                            break;
                        case "CALC_FIELDS":
                            sb.Append(createCalcFields(dbSetInfo));
                            break;
                        case "PK_VALS":
                            sb.Append(pkVals);
                            break;
                    }
                }
            });
            return sb.ToString();
        }

        private string createEntityType(DbSetInfo dbSetInfo)
        {
            var sb = new StringBuilder(512);
            var dbSetType = GetDbSetTypeName(dbSetInfo.dbSetName);
            var entityName = GetEntityName(dbSetInfo.dbSetName);
            var entityInterfaceName = GetEntityInterfaceName(dbSetInfo.dbSetName);
            var entityType = GetEntityTypeName(dbSetInfo.dbSetName);
            var fieldInfos = dbSetInfo.fieldInfos;
            var sbFields = new StringBuilder(512);
            var sbFields2 = new StringBuilder(512);
            var sbFieldsDef = new StringBuilder();
            var sbFieldsInit = new StringBuilder();

            if (_dotNet2TS.IsTypeNameRegistered(entityType))
                throw new ApplicationException(
                    string.Format(
                        "Names collision. Name '{0}' can not be used for an entity type's name because this name is used for a client's type.",
                        entityInterfaceName));

            Action<Field> AddCalculatedField = f =>
            {
                var dataType = GetFieldDataType(f);
                sbFields.AppendFormat("\tget {0}(): {1} {{ return this._aspect._getCalcFieldVal('{0}'); }}", f.fieldName,
                    dataType);
                sbFields.AppendLine();

                sbFields2.AppendFormat("\t{0}: {1};", f.fieldName, dataType);
                sbFields2.AppendLine();
            };

            Action<Field> AddNavigationField = f =>
            {
                var dataType = GetFieldDataType(f);
                sbFields.AppendFormat("\tget {0}(): {1} {{ return this._aspect._getNavFieldVal('{0}'); }}", f.fieldName,
                    dataType);
                sbFields.AppendLine();
                //no writable properties to ParentToChildren navigation fields
                if (!dataType.EndsWith("[]"))
                {
                    sbFields.AppendFormat("\tset {0}(v: {1}) {{ this._aspect._setNavFieldVal('{0}',v); }}", f.fieldName,
                        dataType);
                    sbFields.AppendLine();
                }

                sbFields2.AppendFormat("\t{0}: {1};", f.fieldName, dataType);
                sbFields2.AppendLine();
            };


            Action<Field> AddComplexTypeField = f =>
            {
                var dataType = GetFieldDataType(f);
                sbFields.AppendFormat(
                    "\tget {0}(): {1} {{ if (!this._{0}) {{this._{0} = new {1}('{0}', this._aspect);}} return this._{0}; }}",
                    f.fieldName, dataType);
                sbFields.AppendLine();
                sbFieldsDef.AppendFormat("\tprivate _{0}: {1};", f.fieldName, dataType);
                sbFieldsDef.AppendLine();
                sbFieldsInit.AppendFormat("\t\tthis._{0} = null;", f.fieldName);
                sbFieldsInit.AppendLine();
                sbFields2.AppendFormat("\t{0}: {1};", f.fieldName, dataType);
                sbFields2.AppendLine();
            };

            Action<Field> AddSimpleField = f =>
            {
                var dataType = GetFieldDataType(f);
                sbFields.AppendFormat("\tget {0}(): {1} {{ return this._aspect._getFieldVal('{0}'); }}", f.fieldName,
                    dataType);
                sbFields.AppendLine();
                if (!f.isReadOnly)
                {
                    sbFields.AppendFormat("\tset {0}(v: {1}) {{ this._aspect._setFieldVal('{0}',v); }}", f.fieldName,
                        dataType);
                    sbFields.AppendLine();
                }

                sbFields2.AppendFormat("\t{0}: {1};", f.fieldName, dataType);
                sbFields2.AppendLine();
            };

            fieldInfos.ForEach(fieldInfo =>
            {
                if (fieldInfo.fieldType == FieldType.Calculated)
                {
                    AddCalculatedField(fieldInfo);
                }
                else if (fieldInfo.fieldType == FieldType.Navigation)
                {
                    AddNavigationField(fieldInfo);
                }
                else if (fieldInfo.fieldType == FieldType.Object)
                {
                    AddComplexTypeField(fieldInfo);
                }
                else
                {
                    AddSimpleField(fieldInfo);
                }
            });

            new TemplateParser("Entity.txt").ProcessParts(part =>
            {
                if (!part.isPlaceHolder)
                {
                    sb.Append(part.value);
                }
                else
                {
                    switch (part.value)
                    {
                        case "DBSET_NAME":
                            sb.Append(dbSetInfo.dbSetName);
                            break;
                        case "DBSET_TYPE":
                            sb.Append(dbSetType);
                            break;
                        case "ENTITY_NAME":
                            sb.Append(entityName);
                            break;
                        case "ENTITY_TYPE":
                            sb.Append(entityType);
                            break;
                        case "ENTITY_INTERFACE":
                            sb.Append(entityInterfaceName);
                            break;
                        case "ENTITY_FIELDS":
                            sb.Append(sbFields.ToString());
                            break;
                        case "INTERFACE_FIELDS":
                            sb.Append(sbFields2.ToString());
                            break;
                        case "FIELDS_DEF":
                            sb.Append(sbFieldsDef.ToString());
                            break;
                        case "FIELDS_INIT":
                            sb.Append(sbFieldsInit.ToString());
                            break;
                    }
                }
            });
            return sb.ToString();
        }

        private string GetFieldDataType(Field fieldInfo)
        {
            var fieldName = fieldInfo.fieldName;
            var fieldType = "any";
            var dataType = fieldInfo.dataType;

            if (fieldInfo.fieldType == FieldType.Navigation)
            {
                fieldType = fieldInfo._TypeScriptDataType;
            }
            else if (fieldInfo.fieldType == FieldType.Object)
            {
                fieldType = fieldInfo._TypeScriptDataType;
            }
            else
            {
                fieldType = DotNet2TS.GetTSTypeNameFromDataType(dataType);
            }
            return fieldType;
        }

        public static string GetDbSetTypeName(string dbSetName)
        {
            return string.Format("{0}Db", dbSetName);
        }

        public static string GetEntityTypeName(string dbSetName)
        {
            return string.Format("{0}", dbSetName);
        }

        public static string GetEntityName(string dbSetName)
        {
            return string.Format("{0}Entity", dbSetName);
        }

        public static string GetEntityInterfaceName(string dbSetName)
        {
            return string.Format("I{0}Entity", dbSetName);
        }
    }
}