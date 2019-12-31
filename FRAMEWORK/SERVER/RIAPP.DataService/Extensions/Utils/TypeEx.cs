using System;

namespace RIAPP.DataService.Utils.Extensions
{
    public static class TypeEx
    {
        public static bool IsNullableType(this Type type)
        {
            return type.IsGenericType && type.GetGenericTypeDefinition() == typeof(System.Nullable<>);
        }

    }
}