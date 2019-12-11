using System.Collections.Generic;
using System.Linq.Dynamic.Core.Validation;
using System.Reflection;

namespace System.Linq.Dynamic.Core.Parser
{
    internal static class TypeHelper
    {
        public static Type FindGenericType(Type generic, Type type)
        {
            while (type != null && type != typeof(object))
            {
                if (type.GetTypeInfo().IsGenericType && type.GetGenericTypeDefinition() == generic)
                {
                    return type;
                }

                if (generic.GetTypeInfo().IsInterface)
                {
                    foreach (Type intfType in type.GetInterfaces())
                    {
                        Type found = FindGenericType(generic, intfType);
                        if (found != null) return found;
                    }
                }

                type = type.GetTypeInfo().BaseType;
            }

            return null;
        }

        public static bool IsCompatibleWith(Type source, Type target)
        {
            if (source == target)
            {
                return true;
            }
            if (!target.GetTypeInfo().IsValueType)
            {
                return target.IsAssignableFrom(source);
            }
            Type st = GetNonNullableType(source);
            Type tt = GetNonNullableType(target);

            if (st != source && tt == target)
            {
                return false;
            }
            Type sc = st.GetTypeInfo().IsEnum ? typeof(Object) : st;
            Type tc = tt.GetTypeInfo().IsEnum ? typeof(Object) : tt;

            if (sc == typeof(SByte))
            {
                if (tc == typeof(SByte) || tc == typeof(Int16) || tc == typeof(Int32) || tc == typeof(Int64) || tc == typeof(Single) || tc == typeof(Double) || tc == typeof(Decimal))
                    return true;
            }
            else if (sc == typeof(Byte))
            {
                if (tc == typeof(Byte) || tc == typeof(Int16) || tc == typeof(UInt16) || tc == typeof(Int32) || tc == typeof(UInt32) || tc == typeof(Int64) || tc == typeof(UInt64) || tc == typeof(Single) || tc == typeof(Double) || tc == typeof(Decimal))
                    return true;
            }
            else if (sc == typeof(Int16))
            {
                if (tc == typeof(Int16) || tc == typeof(Int32) || tc == typeof(Int64) || tc == typeof(Single) || tc == typeof(Double) || tc == typeof(Decimal))
                    return true;
            }
            else if (sc == typeof(UInt16))
            {
                if (tc == typeof(UInt16) || tc == typeof(Int32) || tc == typeof(UInt32) || tc == typeof(Int64) || tc == typeof(UInt64) || tc == typeof(Single) || tc == typeof(Double) || tc == typeof(Decimal))
                    return true;
            }
            else if (sc == typeof(Int32))
            {
                if (tc == typeof(Int32) || tc == typeof(Int64) || tc == typeof(Single) || tc == typeof(Double) || tc == typeof(Decimal))
                    return true;
            }
            else if (sc == typeof(UInt32))
            {
                if (tc == typeof(UInt32) || tc == typeof(Int64) || tc == typeof(UInt64) || tc == typeof(Single) || tc == typeof(Double) || tc == typeof(Decimal))
                    return true;
            }
            else if (sc == typeof(Int64))
            {
                if (tc == typeof(Int64) || tc == typeof(Single) || tc == typeof(Double) || tc == typeof(Decimal))
                    return true;
            }
            else if (sc == typeof(UInt64))
            {
                if (tc == typeof(UInt64) || tc == typeof(Single) || tc == typeof(Double) || tc == typeof(Decimal))
                    return true;
            }
            else if (sc == typeof(Single))
            {
                if (tc == typeof(Single) || tc == typeof(Double))
                    return true;
            }

            if (st == tt)
            {
                return true;
            }

            return false;
        }

        public static bool IsEnumType(Type type)
        {
            return GetNonNullableType(type).GetTypeInfo().IsEnum;
        }

        public static bool IsNumericType(Type type)
        {
            return GetNumericTypeKind(type) != 0;
        }

        public static bool IsNullableType(Type type)
        {
            Check.NotNull(type, nameof(type));

            return type.GetTypeInfo().IsGenericType && type.GetGenericTypeDefinition() == typeof(Nullable<>);
        }

        public static bool IsSignedIntegralType(Type type)
        {
            return GetNumericTypeKind(type) == 2;
        }

        public static bool IsUnsignedIntegralType(Type type)
        {
            return GetNumericTypeKind(type) == 3;
        }

        private static int GetNumericTypeKind(Type type)
        {
            type = GetNonNullableType(type);

            if (type.GetTypeInfo().IsEnum)
            {
                return 0;
            }

            if (type == typeof(Char) || type == typeof(Single) || type == typeof(Double) || type == typeof(Decimal))
                return 1;
            if (type == typeof(SByte) || type == typeof(Int16) || type == typeof(Int32) || type == typeof(Int64))
                return 2;
            if (type == typeof(Byte) || type == typeof(UInt16) || type == typeof(UInt32) || type == typeof(UInt64))
                return 3;

            return 0;
        }

        public static string GetTypeName(Type type)
        {
            Type baseType = GetNonNullableType(type);

            string s = baseType.Name;
            if (type != baseType)
            {
                s += '?';
            }
            return s;
        }

        public static Type GetNonNullableType(Type type)
        {
            Check.NotNull(type, nameof(type));

            return IsNullableType(type) ? type.GetTypeInfo().GetGenericTypeArguments()[0] : type;
        }

        public static Type GetUnderlyingType(Type type)
        {
            Check.NotNull(type, nameof(type));

            Type[] genericTypeArguments = type.GetGenericArguments();
            if (genericTypeArguments.Any())
            {
                var outerType = GetUnderlyingType(genericTypeArguments.LastOrDefault());
                return Nullable.GetUnderlyingType(type) == outerType ? type : outerType;
            }

            return type;
        }

        public static IEnumerable<Type> GetSelfAndBaseTypes(Type type)
        {
            if (type.GetTypeInfo().IsInterface)
            {
                var types = new List<Type>();
                AddInterface(types, type);
                return types;
            }
            return GetSelfAndBaseClasses(type);
        }

        private static IEnumerable<Type> GetSelfAndBaseClasses(Type type)
        {
            while (type != null)
            {
                yield return type;
                type = type.GetTypeInfo().BaseType;
            }
        }

        private static void AddInterface(List<Type> types, Type type)
        {
            if (!types.Contains(type))
            {
                types.Add(type);
                foreach (Type t in type.GetInterfaces())
                {
                    AddInterface(types, t);
                }
            }
        }

        public static object ParseNumber(string text, Type type)
        {
            var tp = GetNonNullableType(type);
            if (tp == typeof(SByte))
            {
                sbyte sb;
                if (sbyte.TryParse(text, out sb)) return sb;
            }
            else if (tp == typeof(Byte))
            {
                byte b;
                if (byte.TryParse(text, out b)) return b;
            }
            else if (tp == typeof(Int16))
            {
                short s;
                if (short.TryParse(text, out s)) return s;
            }
            else if (tp == typeof(UInt16))
            {
                ushort us;
                if (ushort.TryParse(text, out us)) return us;
            }
            else if (tp == typeof(Int32))
            {
                int i;
                if (int.TryParse(text, out i)) return i;
            }
            else if (tp == typeof(UInt32))
            {
                uint ui;
                if (uint.TryParse(text, out ui)) return ui;
            }
            else if (tp == typeof(Int64))
            {
                long l;
                if (long.TryParse(text, out l)) return l;
            }
            else if (tp == typeof(UInt64))
            {
                ulong ul;
                if (ulong.TryParse(text, out ul)) return ul;
            }
            else if (tp == typeof(Single))
            {
                float f;
                if (float.TryParse(text, out f)) return f;
            }
            else if (tp == typeof(Double))
            {
                double d;
                if (double.TryParse(text, out d)) return d;
            }
            else if (tp == typeof(Decimal))
            {
                decimal e;
                if (decimal.TryParse(text, out e)) return e;
            }
            return null;
        }

        public static object ParseEnum(string value, Type type)
        {
            if (type.GetTypeInfo().IsEnum && Enum.IsDefined(type, value))
            {
                return Enum.Parse(type, value, true);
            }

            return null;
        }
    }
}
