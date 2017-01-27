using System;
using System.Globalization;
using System.Text;
using RIAPP.DataService.DomainService.Exceptions;
using RIAPP.DataService.DomainService.Types;
using RIAPP.DataService.Resources;
using RIAPP.DataService.Utils.Interfaces;

namespace RIAPP.DataService.Utils
{
    public class ValueConverter : IValueConverter
    {
        private readonly ISerializer serializer;

        public ValueConverter(ISerializer serializer)
        {
            this.serializer = serializer;
        }

        public virtual object DeserializeField(Type propType, Field fieldInfo, string value)
        {
            return DeserializeValue(propType, fieldInfo.dataType, fieldInfo.dateConversion, value);
        }

        public virtual object DeserializeValue(Type propType, DataType dataType, DateConversion dateConversion,
            string value)
        {
            object result = null;
            var IsNullable = IsNullableTypeCore(propType);
            Type propMainType = (!IsNullable)? propType : Nullable.GetUnderlyingType(propType);

            switch (dataType)
            {
                case DataType.Bool:
                    result = ConvertToBool(value, IsNullable);
                    break;
                case DataType.DateTime:
                case DataType.Date:
                case DataType.Time:
                    result = ConvertToDate(value, IsNullable, dateConversion);
                    if (result != null)
                    {
                        if (propMainType == typeof(DateTimeOffset))
                            result = new DateTimeOffset((DateTime)result);
                        else if (propMainType == typeof(TimeSpan))
                            result = ((DateTime)result).TimeOfDay;
                    }
                    break;
                case DataType.Guid:
                    result = ConvertToGuid(value, IsNullable);
                    break;
                case DataType.Integer:
                case DataType.Decimal:
                case DataType.Float:
                    result = ConvertToNumber(value, IsNullable, propType, propMainType);
                    break;
                case DataType.Binary:
                    result = ConvertToBinary(value, propType);
                    break;
                case DataType.String:
                    result = ConvertToString(value, propType);
                    break;
                case DataType.None:
                    result = (propType == typeof(string))? value: ConvertTo(value, IsNullable, propType, propMainType);
                    break;
                default:
                    throw new Exception(string.Format(ErrorStrings.ERR_VAL_DATATYPE_INVALID, dataType));
            }

            return result;
        }

        public virtual string SerializeField(Type propType, Field fieldInfo, object value)
        {
            if (value == null)
                return null;
            var isNullable = IsNullableTypeCore(propType);
            Type realType = (!isNullable) ? propType : Nullable.GetUnderlyingType(propType);

            if (realType == typeof(Guid))
            {
                return GuidToString(value);
            }
            if (realType == typeof(DateTime))
            {
                return DateToString(value, isNullable, fieldInfo.dateConversion);
            }
            if (realType == typeof(TimeSpan))
            {
                return TimeToString(value, isNullable, fieldInfo.dateConversion);
            }
            if (realType == typeof(DateTimeOffset))
            {
                return DateOffsetToString(value, isNullable, fieldInfo.dateConversion);
            }
            if (realType == typeof(bool))
            {
                return BoolToString(value);
            }
            if (value is byte[])
            {
                return BytesToString(value);
            }
            if (realType.IsValueType)
            {
                return (string)Convert.ChangeType(value, typeof(string), CultureInfo.InvariantCulture);
            }
            return value.ToString();
        }

        public virtual DataType DataTypeFromType(Type type, out bool isArray)
        {
            return DataTypeFromTypeCore(type, out isArray);
        }

        public bool IsNullableType(Type propType)
        {
            return IsNullableTypeCore(propType);
        }

        protected object CreateGenericInstance(Type propType, Type propMainType, object[] constructorArgs)
        {
            var typeToConstruct = propType.GetGenericTypeDefinition();
            Type[] argsType = { propMainType };
            var nullableType = typeToConstruct.MakeGenericType(argsType);
            var val = Activator.CreateInstance(nullableType, constructorArgs);
            return val;
        }

        protected virtual object ConvertToBool(string value, bool IsNullableType)
        {
            if (value == null)
                return null;
            return (IsNullableType) ? new Nullable<bool>(bool.Parse(value)): bool.Parse(value);
        }

        protected virtual object ConvertToDate(string value, bool IsNullableType, DateConversion dateConversion)
        {
            if (value == null)
                return null;
            var dt = DateTimeHelper.ParseDateTime(value, dateConversion);
            return (IsNullableType) ? new Nullable<DateTime>(dt) : dt;
        }

        protected virtual object ConvertToGuid(string value, bool IsNullableType)
        {
            if (value == null)
                return null;
            return (IsNullableType)? new Nullable<Guid>(new Guid(value)): new Guid(value);
        }

        protected virtual object ConvertToNumber(string value, bool IsNullableType, Type propType, Type propMainType)
        {
            if (value == null)
                return null;
            var typedVal = Convert.ChangeType(value, propMainType, CultureInfo.InvariantCulture);
            return (IsNullableType)? CreateGenericInstance(propType, propMainType, new[] { typedVal }): typedVal;
        }

        protected virtual object ConvertToBinary(string value, Type propType)
        {
            if (value == null)
                return null;
            if (propType != typeof(byte[]))
                throw new Exception(string.Format(ErrorStrings.ERR_VAL_DATATYPE_INVALID, propType.FullName));
            var sb = new StringBuilder(value);
            sb.Remove(sb.Length - 1, 1); //remove ]
            sb.Remove(0, 1); //remove [
            int cnt = sb.Length, bytesCnt = cnt > 0 ? 1 : 0;

            for (var i = 0; i < cnt; ++i)
            {
                if (sb[i] == ',')
                {
                    bytesCnt += 1;
                }
            }

            var bytes = new byte[bytesCnt];
            bytesCnt = 0; //calculate again
            var val = "";
            for (var i = 0; i < cnt; ++i)
            {
                if (sb[i] == ',')
                {
                    bytes[bytesCnt] = byte.Parse(val);
                    bytesCnt += 1;
                    val = "";
                }
                else
                {
                    if (sb[i] != '"' && sb[i] != ' ')
                        val += sb[i];
                }
            }
            if (val != "")
            {
                bytes[bytesCnt] = byte.Parse(val);
                bytesCnt += 1;
                val = "";
            }

            byte[] bytes2;
            if (bytesCnt < bytes.Length)
            {
                bytes2 = new byte[bytesCnt];
                Buffer.BlockCopy(bytes, 0, bytes2, 0, bytesCnt);
            }
            else
                bytes2 = bytes;

            return bytes2;
        }

        protected virtual object ConvertToString(string value, Type propType)
        {
            if (value == null)
                return null;
            if (propType != typeof(string))
                throw new Exception(string.Format(ErrorStrings.ERR_VAL_DATATYPE_INVALID, propType.FullName));
            return value;
        }

        protected virtual object ConvertTo(string value, bool IsNullableType, Type propType, Type propMainType)
        {
            if (value == null)
                return null;
            object typedVal = null;

            if (!propMainType.IsValueType)
            {
                typedVal = this.serializer.DeSerialize(value, propMainType);
            }
            else
            {
                try
                {
                    typedVal = Convert.ChangeType(value, propMainType, CultureInfo.InvariantCulture);
                }
                catch (InvalidCastException)
                {
                    typedVal = this.serializer.DeSerialize(value, propMainType);
                }
            }

            if (IsNullableType)
            {
                return CreateGenericInstance(propType, propMainType, new[] { typedVal });
            }
            return typedVal;
        }

        protected virtual string GuidToString(object value)
        {
            return value.ToString();
        }

        protected virtual string DateOffsetToString(object value, bool IsNullable, DateConversion dateConversion)
        {
            return (IsNullable)? DateTimeHelper.DateOffsetToString(((DateTimeOffset?)value).Value, dateConversion): DateTimeHelper.DateOffsetToString((DateTimeOffset)value, dateConversion);
        }

        protected virtual string DateToString(object value, bool IsNullable, DateConversion dateConversion)
        {
            return (IsNullable)? DateTimeHelper.DateToString(((DateTime?)value).Value, dateConversion): DateTimeHelper.DateToString((DateTime)value, dateConversion);
        }

        protected virtual string TimeToString(object value, bool IsNullable, DateConversion dateConversion)
        {
            if (IsNullable)
            {
                TimeSpan time = ((TimeSpan?)value).Value;
                return DateTimeHelper.TimeToString(time, dateConversion);
            }
            else
            {
                TimeSpan time = (TimeSpan)value;
                return DateTimeHelper.TimeToString(time, dateConversion);
            }

        }

        protected virtual string BoolToString(object value)
        {
            return value.ToString().ToLowerInvariant();
        }

        protected virtual string BytesToString(object value)
        {
            var bytes = (byte[])value;
            var sb = new StringBuilder(bytes.Length * 4);
            sb.Append("[");
            for (var i = 0; i < bytes.Length; ++i)
            {
                if (i > 0)
                    sb.Append(",");
                sb.Append(bytes[i]);
            }
            sb.Append("]");
            return sb.ToString();
        }

        public static bool IsNullableTypeCore(Type propType)
        {
            return propType.IsGenericType &&
                   propType.GetGenericTypeDefinition() == typeof(System.Nullable<>);
        }

        public static DataType DataTypeFromTypeCore(Type type, out bool isArray)
        {
            bool isNullable = IsNullableTypeCore(type);
            isArray = false;
            Type realType = (!isNullable) ? type : Nullable.GetUnderlyingType(type);
            string fullName = realType.FullName, name = fullName;
            if (fullName.EndsWith("[]"))
            {
                isArray = true;
                name = fullName.Substring(0, fullName.Length - 2);
            }

            switch (name)
            {
                case "System.Byte":
                    if (isArray)
                    {
                        //Binary is data type separate from the array (although it is array by its nature)
                        isArray = false;
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
                    throw new UnsupportedTypeException(string.Format("Unsupported method type {0}", realType.FullName));
            }
        }
    }
}