using System.Linq;
using RIAPP.DataService.DomainService.Types;

namespace RIAPP.DataService.Utils
{
    public class OperationalMethods : MultiMap<string, MethodInfoData>
    {
        public MethodInfoData GetMethod(string dbSetName, MethodType methodType)
        {
            var list = this[dbSetName];
            return list.Where(m => m.methodType == methodType).FirstOrDefault();
        }
    }
}