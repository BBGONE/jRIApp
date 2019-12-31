﻿using RIAPP.DataService.Core;
using RIAPP.DataService.Core.Types;
using RIAPP.DataService.Resources;
using RIAPP.DataService.Utils.Extensions;
using System;
using System.Globalization;
using System.Text;

namespace RIAPP.DataService.Utils
{
    public class ValueConverter<TService> : IValueConverter<TService>
        where TService : BaseDomainService
    {
        private readonly ISerializer serializer;

        public ValueConverter(ISerializer serializer)
        {
            this.serializer = serializer?? throw new ArgumentNullException(nameof(serializer), ErrorStrings.ERR_NO_SERIALIZER);
        }

        public virtual object DeserializeField(Type propType, Field fieldInfo, string value)
        {
            return DeserializeValue(propType, fieldInfo.dataType, fieldInfo.dateConversion, value);
        }

        public virtual object DeserializeValue(Type propType, DataType dataType, DateConversion dateConversion,
            string value)
        {
            object result = null;
            var IsNullable = propType.IsNullableType();
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
            var isNullable = propType.IsNullableType();
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

        public virtual DataType DataTypeFromType(Type type)
        {
            return type.GetDataType();
        }

        protected object CreateGenericInstance(Type propType, Type propMainType, object[] constructorArgs)
        {
            var typeToConstruct = propType.GetGenericTypeDefinition();
            Type[] argsType = { propMainType };
            var concreteType = typeToConstruct.MakeGenericType(argsType);
            var val = Activator.CreateInstance(concreteType, constructorArgs);
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
    }
}