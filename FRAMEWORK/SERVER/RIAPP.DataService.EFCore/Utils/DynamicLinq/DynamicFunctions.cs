using System.Linq.Dynamic.Core.CustomTypeProviders;

namespace Microsoft.EntityFrameworkCore.DynamicLinq
{
    [DynamicLinqType]
    public static class DynamicFunctions
    {
        public static bool Like(string matchExpression, string pattern) => EF.Functions.Like(matchExpression, pattern);

        public static bool Like(string matchExpression, string pattern, string escapeCharacter) => EF.Functions.Like(matchExpression, pattern, escapeCharacter);
    }
}
