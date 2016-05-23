using System;
using RIAPP.DataService.DomainService.Types;

namespace RIAPP.DataService.Utils.Interfaces
{
    public interface IValueConverter
    {
        string SerializeField(Type propType, Field fieldInfo, object value);
        object DeserializeField(Type propType, Field fieldInfo, string value);
        object DeserializeValue(Type propType, DataType dataType, DateConversion dateConversion, string value);
        bool IsNullableType(Type propType);
        DataType DataTypeFromType(Type type, out bool isArray);
    }
}