using RIAPP.DataService.DomainService.Types;
using System.Collections.Generic;
using System.Linq;

namespace RIAPP.DataService.DomainService.Metadata
{
    public static class MethodInfoEx
    {
        public static IEnumerable<MethodInfoData> GetQueryOnly(this IEnumerable<MethodInfoData> allList)
        {
            return allList.Where(info => info.MethodType == MethodType.Query);
        }

        public static IEnumerable<MethodInfoData> GetQueryAndInvokeOnly(this IEnumerable<MethodInfoData> allList)
        {
            return allList.Where(info => info.MethodType == MethodType.Query || info.MethodType == MethodType.Invoke);
        }

        public static IEnumerable<MethodInfoData> GetOthersOnly(this IEnumerable<MethodInfoData> allList)
        {
            return allList.Where(
                    info => !(info.MethodType == MethodType.Query || info.MethodType == MethodType.Invoke ||
                          info.MethodType == MethodType.None));
        }
    }
}