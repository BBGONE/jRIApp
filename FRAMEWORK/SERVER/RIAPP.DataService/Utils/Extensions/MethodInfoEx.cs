using System.Collections.Generic;
using System.Linq;
using RIAPP.DataService.DomainService.Types;

namespace RIAPP.DataService.Utils.Extensions
{
    public static class MethodInfoEx
    {
        public static IEnumerable<MethodInfoData> GetQueryOnly(this IEnumerable<MethodInfoData> allList)
        {
            return allList.Where(info => info.methodType == MethodType.Query);
        }

        public static IEnumerable<MethodInfoData> GetQueryAndInvokeOnly(this IEnumerable<MethodInfoData> allList)
        {
            return allList.Where(info => info.methodType == MethodType.Query || info.methodType == MethodType.Invoke);
        }

        public static IEnumerable<MethodInfoData> GetOthersOnly(this IEnumerable<MethodInfoData> allList)
        {
            return
                allList.Where(
                    info =>
                        !(info.methodType == MethodType.Query || info.methodType == MethodType.Invoke ||
                          info.methodType == MethodType.None));
        }
    }
}