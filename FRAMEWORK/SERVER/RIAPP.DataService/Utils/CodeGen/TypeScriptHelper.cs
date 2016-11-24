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
using RIAPP.DataService.Utils.Interfaces;

namespace RIAPP.DataService.Utils.CodeGen
{
    public class TypeScriptHelper
    {
        private readonly List<Type> _clientTypes;
        private DotNet2TS _dotNet2TS;
        private readonly CachedMetadata _metadata;
        private readonly StringBuilder _sb = new StringBuilder(4096);
        private readonly IServiceContainer _serviceContainer;
        private readonly List<DbSetInfo> _dbSets;
        private readonly List<Association> _associations;
        private readonly ISerializer _serializer;

        private readonly TemplateParser _entityTemplate = new TemplateParser(GetTemplate("Entity.txt"));
        private readonly TemplateParser _entityIntfTemplate = new TemplateParser(GetTemplate("EntityInterface.txt"));
        private readonly TemplateParser _dictionaryTemplate = new TemplateParser(GetTemplate("Dictionary.txt"));
        private readonly TemplateParser _listTemplate = new TemplateParser(GetTemplate("List.txt"));
        private readonly TemplateParser _listItemTemplate = new TemplateParser(GetTemplate("ListItem.txt"));
        private readonly TemplateParser _dbSetTemplate = new TemplateParser(GetTemplate("DbSet.txt"));
        private static string GetTemplate(string ID)
        {
            return ResourceStringHelper.Get(ID);
        }

        public TypeScriptHelper(IServiceContainer serviceContainer, CachedMetadata metadata,
            IEnumerable<Type> clientTypes)
        {
            if (serviceContainer == null)
                throw new ArgumentException("converter parameter must not be null", "serviceContainer");
            _serviceContainer = serviceContainer;
            if (metadata == null)
                throw new ArgumentException("metadata parameter must not be null", "metadata");
            _metadata = metadata;
            _serializer = _serviceContainer.Serializer;
            _clientTypes = new List<Type>(clientTypes == null ? Enumerable.Empty<Type>() : clientTypes);
            _dbSets = _metadata.dbSets.Values.OrderBy(v => v.dbSetName).ToList();
            _associations = _metadata.associations.Values.OrderBy(a=>a.name).ToList();
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

        private static string TrimEnd(string s)
        {
            if (!string.IsNullOrEmpty(s))
                return s.TrimEnd('\r', '\n', '\t', ' ');

            return string.Empty;
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
          
            _dbSets.ForEach(dbSetInfo =>
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

            _dbSets.ForEach(dbSetInfo =>
            {
                var res = createEntityType(dbSetInfo);
                //write interface definition for entity
                WriteStringLine(res.Key);
                WriteLine();
                WriteStringLine(createDbSetType(res.Value, dbSetInfo));
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
            return TemplateParser.ProcessTemplate(GetTemplate("Header.txt"), new Dictionary<string, Func<string>>());
        }

        private string createDbSetProps()
        {
            var sb = new StringBuilder(512);
            _dbSets.ForEach(dbSetInfo =>
            {
                var dbSetType = GetDbSetTypeName(dbSetInfo.dbSetName);
                sb.AppendFormat("\tget {0}() {{ return <{1}>this.getDbSet(\"{0}\"); }}", dbSetInfo.dbSetName, dbSetType);
                sb.AppendLine();
            });

            return TrimEnd(sb.ToString());
        }

        private string createIAssocs()
        {
            var sb = new StringBuilder(512);
            sb.AppendLine("export interface IAssocs");
            sb.AppendLine("{");
            foreach(var assoc in _associations)
            {
                sb.AppendFormat("\tget{0}: {1};", assoc.name, "()=> dbMOD.Association");
                sb.AppendLine();
            }
            sb.AppendLine("}");
            return sb.ToString();
        }

        private string _CreateParamSignature(ParamMetadata paramInfo)
        {
            return string.Format("{0}{1}: {2}{3};", paramInfo.name, paramInfo.isNullable ? "?" : "",
                paramInfo.dataType == DataType.None
                    ? _dotNet2TS.RegisterType(paramInfo.ParameterType)
                    : DotNet2TS.GetTSTypeNameFromDataType(paramInfo.dataType),
                paramInfo.dataType != DataType.None && paramInfo.isArray ? "[]" : "");
        }

        private void processMethodArgs()
        {
            foreach(var methodInfo in _metadata.GetInvokeMethods())
            {
                if (methodInfo.parameters.Count() > 0)
                {
                    methodInfo.parameters.ForEach(paramInfo =>
                    {
                        //if this is complex type parse parameter to create its typescript interface
                        if (paramInfo.dataType == DataType.None)
                            _dotNet2TS.RegisterType(paramInfo.ParameterType);
                    });
                }
            }
        }

        private string createISvcMethods()
        {
            var sbISvcMeth = new StringBuilder(512);
            sbISvcMeth.AppendLine("export interface ISvcMethods");
            sbISvcMeth.AppendLine("{");
            var sbArgs = new StringBuilder(255);
            var svcMethods = _metadata.GetInvokeMethods().OrderBy(m=>m.methodName).ToList();
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
                            _dotNet2TS.RegisterType(
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
                        sbArgs.Append(_dotNet2TS.RegisterType(methodInfo.methodData.methodInfo.ReturnType));
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

            return TrimEnd(sbISvcMeth.ToString());
        }

        private string createClientTypes()
        {
            var sb = new StringBuilder(1024);

            for (var i = 0; i < _clientTypes.Count(); ++i)
            {
                var type = _clientTypes[i];
                sb.Append(createClientType(type));
            }

            return TrimEnd(sb.ToString());
        }

        private string createDictionary(string name, string keyName, string itemName, string aspectName,
            string interfaceName, string properties, List<PropertyInfo> propList)
        {
            var pkProp = propList.Where(propInfo => keyName == propInfo.Name).SingleOrDefault();
            if (pkProp == null)
                throw new Exception(string.Format("Dictionary item does not have a property with a name {0}", keyName));
            var pkVals = pkProp.Name.toCamelCase() + ": " + _dotNet2TS.RegisterType(pkProp.PropertyType);

            Dictionary<string, Func<string>> dic = new Dictionary<string, Func<string>>();
            dic.Add("DICT_NAME", () => name);
            dic.Add("ITEM_TYPE_NAME", () => itemName);
            dic.Add("ASPECT_NAME", () => aspectName);
            dic.Add("INTERFACE_NAME", () => interfaceName);
            dic.Add("PROPS", () => properties);
            dic.Add("KEY_NAME", () => keyName);
            dic.Add("PK_VALS", () => pkVals);

            return TemplateParser.ProcessTemplate(_dictionaryTemplate, dic);
        }

        private string createList(string name, string itemName, string aspectName, string interfaceName,
            string properties)
        {
            Dictionary<string, Func<string>> dic = new Dictionary<string, Func<string>>();
            dic.Add("LIST_NAME", () => name);
            dic.Add("ITEM_TYPE_NAME", () => itemName);
            dic.Add("ASPECT_NAME", () => aspectName);
            dic.Add("INTERFACE_NAME", () => interfaceName);
            dic.Add("PROP_INFOS", () => properties);

            return TemplateParser.ProcessTemplate(_listTemplate, dic);
        }

        private string createListItem(string itemName, string aspectName, string interfaceName,
            List<PropertyInfo> propInfos)
        {
            var sbProps = new StringBuilder(512);
            propInfos.ForEach(propInfo =>
            {
                sbProps.AppendLine(string.Format("\tget {0}():{1} {{ return <{1}>this._aspect._getProp('{0}'); }}",
                    propInfo.Name, _dotNet2TS.RegisterType(propInfo.PropertyType)));
                sbProps.AppendLine(string.Format("\tset {0}(v:{1}) {{ this._aspect._setProp('{0}', v); }}",
                    propInfo.Name, _dotNet2TS.RegisterType(propInfo.PropertyType)));
            });

            Dictionary<string, Func<string>> dic = new Dictionary<string, Func<string>>();
            dic.Add("LIST_ITEM_NAME", () => itemName);
            dic.Add("INTERFACE_NAME", () => interfaceName);
            dic.Add("ASPECT_NAME", () => aspectName);
            dic.Add("ITEM_PROPS", () => sbProps.ToString());

            return TemplateParser.ProcessTemplate(_listItemTemplate, dic);
        }

        private string createClientType(Type type)
        {
            var dictAttr = type.GetCustomAttributes(typeof(DictionaryAttribute), false)
                    .OfType<DictionaryAttribute>()
                    .FirstOrDefault();
            var listAttr = type.GetCustomAttributes(typeof(ListAttribute), false).OfType<ListAttribute>().FirstOrDefault();

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
            var interfaceName = _dotNet2TS.RegisterType(type);

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
                sb.AppendLine(createListItem(listItemName, itemAspectName, interfaceName, propInfos));
                sb.AppendLine();
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

        private string createDbSetQueries(DbSetInfo dbSetInfo)
        {
            var sb = new StringBuilder(256);
            var sbArgs = new StringBuilder(256);
            var queries = _metadata.GetQueryMethods(dbSetInfo.dbSetName);
            var entityInterfaceName = GetEntityInterfaceName(dbSetInfo.dbSetName);

            foreach(var methodDescription in queries)
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
                sb.AppendFormat("\tcreate{0}Query({1}): dbMOD.DataQuery<{2}>", methodDescription.methodName, sbArgs.ToString(), entityInterfaceName);
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
            };

            return TrimEnd(sb.ToString());
        }

        private string createCalcFields(DbSetInfo dbSetInfo)
        {
            var entityType = GetEntityTypeName(dbSetInfo.dbSetName);
            var entityInterfaceName = GetEntityInterfaceName(dbSetInfo.dbSetName);
            var dataHelper = _serviceContainer.DataHelper;
            var sb = new StringBuilder(256);

            dbSetInfo.fieldInfos.ForEach(fieldInfo =>
            {
                dataHelper.ForEachFieldInfo("", fieldInfo, (fullName, f) =>
                {
                    if (f.fieldType == FieldType.Calculated)
                    {
                        sb.AppendFormat("\tdefine{0}Field(getFunc: (item: {1}) => {2})", fullName.Replace('.', '_'),
                            entityInterfaceName, GetFieldDataType(f));
                        sb.Append(" { ");
                        sb.AppendFormat("this._defineCalculatedField('{0}', getFunc);", fullName);
                        sb.Append(" }");
                        sb.AppendLine();
                    }
                });
            });

            return TrimEnd(sb.ToString());
        }

        private string createDbContextType()
        {
            var sb = new StringBuilder(512);
            var dbSetNames = _dbSets.Select(d => d.dbSetName).ToArray();
            var sbCreateDbSets = new StringBuilder(512);
            _dbSets.ForEach(dbSetInfo =>
            {
                var dbSetType = GetDbSetTypeName(dbSetInfo.dbSetName);
                sbCreateDbSets.AppendFormat("\t\tthis._createDbSet(\"{0}\",{1});", dbSetInfo.dbSetName, dbSetType);
                sbCreateDbSets.AppendLine();
            });

            Dictionary<string, Func<string>> dic = new Dictionary<string, Func<string>>();
            dic.Add("DBSETS_NAMES", () => _serializer.Serialize(dbSetNames));
            dic.Add("DBSETS_PROPS", () => createDbSetProps());
            dic.Add("DBSETS", () => sbCreateDbSets.ToString().Trim('\r', '\n', ' '));
            dic.Add("TIMEZONE", () => DateTimeHelper.GetTimezoneOffset().ToString());
            dic.Add("ASSOCIATIONS", () => _serializer.Serialize(_associations));
            dic.Add("METHODS", () => _serializer.Serialize(_metadata.methodDescriptions.OrderByDescending(m=>m.isQuery).ThenBy(m=>m.methodName)));

            return TemplateParser.ProcessTemplate(GetTemplate("DbContext.txt"), dic);
        }

        private string createDbSetType(string entityDef, DbSetInfo dbSetInfo)
        {
            var sb = new StringBuilder(512);
            var dbSetType = GetDbSetTypeName(dbSetInfo.dbSetName);
            var entityTypeName = GetEntityTypeName(dbSetInfo.dbSetName);
            var entityInterfaceName = GetEntityInterfaceName(dbSetInfo.dbSetName);
            var childAssoc = _associations.Where(assoc => assoc.childDbSetName == dbSetInfo.dbSetName).ToList();
            var parentAssoc = _associations.Where(assoc => assoc.parentDbSetName == dbSetInfo.dbSetName).ToList();
            var fieldInfos = dbSetInfo.fieldInfos;

            var pkFields = dbSetInfo.GetPKFields();
            var pkVals = "";
            foreach (var pkField in pkFields)
            {
                if (!string.IsNullOrEmpty(pkVals))
                    pkVals += ", ";
                pkVals += pkField.fieldName.toCamelCase() + ": " + GetFieldDataType(pkField);
            }
            Dictionary<string, Func<string>> dic = new Dictionary<string, Func<string>>();
            dic.Add("DBSET_NAME", () => dbSetInfo.dbSetName);
            dic.Add("DBSET_TYPE", () => dbSetType);
            dic.Add("ENTITY", () => entityDef);
            dic.Add("ENTITY_TYPE", () => entityTypeName);
            dic.Add("ENTITY_INTERFACE", () => entityInterfaceName);
            dic.Add("DBSET_INFO", () => {
                //we are making copy of the object, in order that we don't change original object
                //while it can be accessed by other threads
                //we change our own copy, making it threadsafe
                var copy = dbSetInfo.ShallowCopy();
                copy._fieldInfos = new FieldsList(); //serialze with empty field infos
                return _serializer.Serialize(copy);
            });
            dic.Add("FIELD_INFOS", () => _serializer.Serialize(dbSetInfo.fieldInfos));
            dic.Add("CHILD_ASSOC", () => _serializer.Serialize(childAssoc));
            dic.Add("PARENT_ASSOC", () => _serializer.Serialize(parentAssoc));
            dic.Add("QUERIES", () => createDbSetQueries(dbSetInfo));
            dic.Add("CALC_FIELDS", () => createCalcFields(dbSetInfo));
            dic.Add("PK_VALS", () => pkVals);

            return TemplateParser.ProcessTemplate(_dbSetTemplate, dic);
        }

        private string createEntityInterface(string entityInterfaceName, string fieldsDef)
        {
            Dictionary<string, Func<string>> dic = new Dictionary<string, Func<string>>();
            dic.Add("ENTITY_INTERFACE", () => entityInterfaceName);
            dic.Add("INTERFACE_FIELDS", () => fieldsDef);

            return TrimEnd(TemplateParser.ProcessTemplate(_entityIntfTemplate, dic));
        }

        
        private KeyValuePair<string, string> createEntityType(DbSetInfo dbSetInfo)
        {
            var dbSetType = GetDbSetTypeName(dbSetInfo.dbSetName);
            var entityInterfaceName = GetEntityInterfaceName(dbSetInfo.dbSetName);
            var entityTypeName = GetEntityTypeName(dbSetInfo.dbSetName);
            var fieldInfos = dbSetInfo.fieldInfos;
            var sbFields = new StringBuilder(512);
            var sbFieldsDef = new StringBuilder();
            var sbFieldsInit = new StringBuilder();
            var sbInterfaceFields = new StringBuilder(512);

            if (_dotNet2TS.IsTypeNameRegistered(entityInterfaceName))
                throw new ApplicationException(
                    string.Format("Names collision. Name '{0}' can not be used for an entity type's name because this name is used for a client's type.",
                        entityInterfaceName));
            
            Action<Field> AddCalculatedField = f =>
            {
                var dataType = GetFieldDataType(f);
                sbFields.AppendFormat("\tget {0}(): {1} {{ return this._aspect._getCalcFieldVal('{0}'); }}", f.fieldName,
                    dataType);
                sbFields.AppendLine();

                sbInterfaceFields.AppendFormat("\treadonly {0}: {1};", f.fieldName, dataType);
                sbInterfaceFields.AppendLine();
            };

            Action<Field> AddNavigationField = f =>
            {
                var dataType = GetFieldDataType(f);
                sbFields.AppendFormat("\tget {0}(): {1} {{ return this._aspect._getNavFieldVal('{0}'); }}", f.fieldName,
                    dataType);
                sbFields.AppendLine();
                //no writable properties to ParentToChildren navigation fields
                bool isReadonly = dataType.EndsWith("[]");
                if (!isReadonly)
                {
                    sbFields.AppendFormat("\tset {0}(v: {1}) {{ this._aspect._setNavFieldVal('{0}',v); }}", f.fieldName,
                        dataType);
                    sbFields.AppendLine();
                }

                sbInterfaceFields.AppendFormat("\t{0}{1}: {2};", isReadonly ? "readonly " : "", f.fieldName, dataType);
                sbInterfaceFields.AppendLine();
            };

            Action<Field> AddComplexTypeField = f =>
            {
                var dataType = GetFieldDataType(f);
                sbFields.AppendFormat("\tget {0}(): {1} {{ if (!this._{0}) {{this._{0} = new {1}('{0}', this._aspect);}} return this._{0}; }}",
                    f.fieldName, dataType);
                sbFields.AppendLine();
                sbFieldsDef.AppendFormat("\tprivate _{0}: {1};", f.fieldName, dataType);
                sbFieldsDef.AppendLine();
                sbFieldsInit.AppendFormat("\t\tthis._{0} = null;", f.fieldName);
                sbFieldsInit.AppendLine();
                sbInterfaceFields.AppendFormat("\treadonly {0}: {1};", f.fieldName, dataType);
                sbInterfaceFields.AppendLine();
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

                sbInterfaceFields.AppendFormat("\t{0}{1}: {2};", f.isReadOnly?"readonly ":"", f.fieldName, dataType);
                sbInterfaceFields.AppendLine();
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

            Dictionary<string, Func<string>> dic = new Dictionary<string, Func<string>>();
            dic.Add("DBSET_NAME", () => dbSetInfo.dbSetName);
            dic.Add("DBSET_TYPE", () => dbSetType);
            dic.Add("ENTITY_TYPE", () => entityTypeName);
            dic.Add("ENTITY_INTERFACE", () => entityInterfaceName);
            dic.Add("ENTITY_FIELDS", () => TrimEnd(sbFields.ToString()));
            dic.Add("FIELDS_DEF", () => TrimEnd(sbFieldsDef.ToString()));
            dic.Add("FIELDS_INIT", () => TrimEnd(sbFieldsInit.ToString()));

            string entityDef = TrimEnd(TemplateParser.ProcessTemplate(_entityTemplate, dic));
            string interfaceDef = this.createEntityInterface(entityInterfaceName, TrimEnd(sbInterfaceFields.ToString()));

            return new KeyValuePair<string, string>(interfaceDef, entityDef);
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
            return string.Format("{0}Entity", dbSetName);
        }

        public static string GetEntityInterfaceName(string dbSetName)
        {
            return string.Format("{0}", dbSetName);
        }
    }
}