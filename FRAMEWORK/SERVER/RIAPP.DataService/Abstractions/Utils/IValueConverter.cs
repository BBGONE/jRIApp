using RIAPP.DataService.Core;
using RIAPP.DataService.Core.Types;
using System;

namespace RIAPP.DataService.Utils
{
    public interface IValueConverter
    {
        string SerializeField(Type propType, Field fieldInfo, object value);
        object DeserializeField(Type propType, Field fieldInfo, string value);
        object DeserializeValue(Type propType, DataType dataType, DateConversion dateConversion, string value);
        DataType DataTypeFromType(Type type, out bool isArray);
    }

    public interface IValueConverter<TService>: IValueConverter
        where TService : BaseDomainService
    {

    }
}