using System.Linq;

namespace RIAPP.DataService.Core.Types
{
    public static class FieldEx
    {
        public static FieldName[] GetNames(this Field fieldInfo)
        {
            return fieldInfo.GetNestedInResultFields()
                    .Select(fi =>
                            new FieldName
                            {
                                n = fi.fieldName,
                                p = fi.fieldType == FieldType.Object ? fi.GetNames() : null
                            })
                    .ToArray();
        }

        public static int GetOrdinal(this Field field)
        {
            return field._ordinal;
        }

        public static void SetOrdinal(this Field field, int ordinal)
        {
            field._ordinal = ordinal;
        }

        public static string GetFullName(this Field field)
        {
            return field._FullName;
        }

        public static void SetFullName(this Field field, string fullName)
        {
            field._FullName = fullName;
        }

        public static string GetTypeScriptDataType(this Field field)
        {
            return field._TypeScriptDataType;
        }

        public static void SetTypeScriptDataType(this Field field, string typeScriptDataType)
        {
            field._TypeScriptDataType = typeScriptDataType;
        }

        public static string GetDataTypeName(this Field field)
        {
            return field.dataTypeName;
        }

        public static void SetDataTypeName(this Field field, string dataTypeName)
        {
            field.dataTypeName = dataTypeName;
        }
    }
}