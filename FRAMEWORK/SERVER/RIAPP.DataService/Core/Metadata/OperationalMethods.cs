using RIAPP.DataService.Core.Types;
using RIAPP.DataService.Utils;
using System.Linq;

namespace RIAPP.DataService.Core.Metadata
{
    public class OperationalMethods : MultiMap<string, MethodInfoData>
    {
        public MethodInfoData GetMethod(string dbSetName, MethodType methodType)
        {
            var list = this[dbSetName];
            return list.Where(m => m.MethodType == methodType).FirstOrDefault();
        }
    }
}