using RIAPP.DataService.Core.Exceptions;
using RIAPP.DataService.Core.Types;
using System;

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

        public static DataType GetDataType(this Type type)
        {
            bool isArray = type.IsArray;
            if (isArray)
            {
                type = type.GetElementType();
            }

            bool isNullable = type.IsNullableType();
            Type realType = (!isNullable) ? type : Nullable.GetUnderlyingType(type);

            string fullName = realType.FullName, name = fullName;

            switch (name)
            {
                case "System.Byte":
                    if (isArray)
                    {
                        // Binary is data type separate from the array (although it is array by its nature)
                        return DataType.Binary;
                    }
                    return DataType.Integer;
                case "System.String":
                    return DataType.String;
                case "System.Int16":
                case "System.Int32":
                case "System.Int64":
                case "System.UInt16":
                case "System.UInt32":
                case "System.UInt64":
                    return DataType.Integer;
                case "System.Decimal":
                    return DataType.Decimal;
                case "System.Double":
                case "System.Single":
                    return DataType.Float;
                case "System.DateTime":
                case "System.DateTimeOffset":
                    return DataType.DateTime;
                case "System.TimeSpan":
                    return DataType.Time;
                case "System.Boolean":
                    return DataType.Bool;
                case "System.Guid":
                    return DataType.Guid;
                default:
                    throw new UnsupportedTypeException(string.Format("Unsupported method type {0}", fullName));
            }
        }
    }
}