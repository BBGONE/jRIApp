using System.Reflection.Emit;

// ReSharper disable once CheckNamespace
namespace System.Reflection
{
    internal static class CustomTypeBuilderExtensions
    {
        public static Type CreateType(this TypeBuilder tb)
        {
            return tb.CreateTypeInfo().AsType();
        }
    }
}
