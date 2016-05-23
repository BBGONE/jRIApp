using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using RIAPP.DataService.DomainService.Interfaces;
using RIAPP.DataService.DomainService.Types;

namespace RIAPP.DataService.Utils.CodeGen
{
    public class ComplexTypeBuilder
    {
        private readonly Dictionary<string, string> _complexTypes;
        private readonly DotNet2TS _dotNet2TS;

        public ComplexTypeBuilder(DotNet2TS dotNet2TS)
        {
            _dotNet2TS = dotNet2TS;
            _complexTypes = new Dictionary<string, string>();
        }

        protected internal IServiceContainer ServiceContainer
        {
            get { return _dotNet2TS.ServiceContainer; }
        }

        public string CreateComplexType(DbSetInfo dbSetInfo, Field fieldInfo, int level)
        {
            string typeName;
            if (level == 0)
            {
                typeName = string.Format("{0}_{1}", dbSetInfo.dbSetName, fieldInfo.fieldName);
            }
            else
            {
                //to prevent names collision the type name is a three part name
                typeName = string.Format("{0}_{1}{2}", dbSetInfo.dbSetName, fieldInfo.fieldName, level);
            }

            fieldInfo._TypeScriptDataType = typeName;

            var sb = new StringBuilder(512);
            var sbProperties = new StringBuilder();
            var sbFieldsDef = new StringBuilder();
            var sbFieldsInit = new StringBuilder();

            Action<Field> AddProperty = f =>
            {
                var dataType = GetFieldDataType(f);
                sbProperties.AppendFormat("\tget {0}(): {2} {{ return this.getValue('{1}'); }}", f.fieldName,
                    f._FullName, dataType);
                sbProperties.AppendLine();
                if (!f.isReadOnly)
                {
                    sbProperties.AppendFormat("\tset {0}(v: {2}) {{ this.setValue('{1}', v); }}", f.fieldName,
                        f._FullName, dataType);
                    sbProperties.AppendLine();
                }
            };

            Action<Field> AddCalculatedProperty = f =>
            {
                var dataType = GetFieldDataType(f);
                sbProperties.AppendFormat("\tget {0}(): {2} {{ return this.getEntity()._getCalcFieldVal('{1}'); }}",
                    f.fieldName, f._FullName, dataType);
                sbProperties.AppendLine();
            };

            Action<Field, string> AddComplexProperty = (f, dataType) =>
            {
                sbProperties.AppendFormat(
                    "\tget {0}(): {1} {{ if (!this._{0}) {{this._{0} = new {1}('{0}', this);}} return this._{0}; }}",
                    f.fieldName, dataType);
                sbProperties.AppendLine();
                sbFieldsDef.AppendFormat("\tprivate _{0}: {1};", f.fieldName, dataType);
                sbFieldsDef.AppendLine();
                sbFieldsInit.AppendFormat("\t\tthis._{0} = null;", f.fieldName);
                sbFieldsInit.AppendLine();
            };

            fieldInfo.nested.ForEach(f =>
            {
                if (f.fieldType == FieldType.Calculated)
                {
                    AddCalculatedProperty(f);
                }
                else if (f.fieldType == FieldType.Navigation)
                {
                    throw new InvalidOperationException("Navigation fields are not allowed on complex type properties");
                }
                else if (f.fieldType == FieldType.Object)
                {
                    var dataType = CreateComplexType(dbSetInfo, f, level + 1);
                    AddComplexProperty(f, dataType);
                }
                else
                {
                    AddProperty(f);
                }
            });

            var templateName = "RootComplexProperty.txt";
            if (level > 0)
                templateName = "ChildComplexProperty.txt";

            new TemplateParser(templateName).ProcessParts(part =>
            {
                if (!part.isPlaceHolder)
                {
                    sb.Append(part.value);
                }
                else
                {
                    switch (part.value)
                    {
                        case "PROPERTIES":
                            sb.Append(sbProperties.ToString());
                            break;
                        case "TYPE_NAME":
                            sb.Append(typeName);
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

            _complexTypes.Add(typeName, sb.ToString());
            return typeName;
        }

        public string GetComplexTypes()
        {
            var sb = new StringBuilder(1024);
            _complexTypes.Values.ToList().ForEach(typeDef =>
            {
                sb.AppendLine(typeDef);
                sb.AppendLine();
            });
            return sb.ToString().TrimEnd('\r', '\n');
        }

        private string GetFieldDataType(Field fieldInfo)
        {
            var fieldName = fieldInfo.fieldName;
            var fieldType = "any";
            var dataType = fieldInfo.dataType;

            fieldType = DotNet2TS.GetTSTypeNameFromDataType(dataType);
            return fieldType;
        }
    }
}