using RIAPP.DataService.Core.Exceptions;
using RIAPP.DataService.Core.Types;
using System;
using System.Collections.Generic;

namespace RIAPP.DataService.Utils.Extensions
{
    public static class TypeEx
    {
        public static bool IsNullableType(this Type type)
        {
            return type.IsGenericType && type.GetGenericTypeDefinition() == typeof(System.Nullable<>);
        }

        public static bool IsArrayType(this Type type)
        {
            bool isArray = type.IsArray;
            if (isArray)
            {
                return typeof(byte) == type.GetElementType() ? false : true;
            }
            else
            {
                return false;
            }

        }

        static readonly Dictionary<Type, DataType> typeMap = new Dictionary<Type, DataType>
        {
            { typeof(byte), DataType.Binary },
            { typeof(string), DataType.String },
            { typeof(Int16), DataType.Integer },
            { typeof(Int32), DataType.Integer },
            { typeof(Int64), DataType.Integer },
            { typeof(UInt16), DataType.Integer },
            { typeof(UInt32), DataType.Integer },
            { typeof(UInt64), DataType.Integer },
            { typeof(Decimal), DataType.Decimal },
            { typeof(Double), DataType.Float },
            { typeof(Single), DataType.Float },
            { typeof(DateTime), DataType.DateTime },
            { typeof(DateTimeOffset), DataType.DateTime },
            { typeof(TimeSpan), DataType.Time },
            { typeof(Boolean), DataType.Bool },
            { typeof(Guid), DataType.Guid }
        };

        public static DataType GetDataType(this Type type)
        {
            bool isArray = type.IsArray;
            if (isArray)
            {
                type = type.GetElementType();
            }

            bool isNullable = type.IsNullableType();
            Type realType = (!isNullable) ? type : Nullable.GetUnderlyingType(type);

            if (typeMap.TryGetValue(realType, out DataType dataType))
            {
                if (dataType == DataType.Binary && !isArray)
                {
                    dataType = DataType.Integer;
                }

                return dataType;
            }
            else
            {
                throw new UnsupportedTypeException($"Unsupported type {type.FullName}");
            }
        }
    }
}