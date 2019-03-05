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
    }
}