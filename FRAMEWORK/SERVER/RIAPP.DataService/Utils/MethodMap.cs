using System.Collections.Generic;
using System.Linq;
using RIAPP.DataService.DomainService.Types;

namespace RIAPP.DataService.Utils
{
    public class MethodMap : MultiMap<string, MethodDescription>
    {
        public IEnumerable<MethodDescription> GetQueryMethods(string dbSetName)
        {
            return this[dbSetName].Where(m => m.methodData.methodType == MethodType.Query);
        }

        public IEnumerable<MethodDescription> GetInvokeMethods()
        {
            return this[""].Where(m => m.methodData.methodType == MethodType.Invoke);
        }

        public MethodDescription GetQueryMethod(string dbSetName, string queryName)
        {
            var list = GetQueryMethods(dbSetName);
            return list.Where(m => m.methodName == queryName).FirstOrDefault();
        }

        public MethodDescription GetInvokeMethod(string methodName)
        {
            var list = GetInvokeMethods();
            return list.Where(m => m.methodName == methodName).FirstOrDefault();
        }
    }
}