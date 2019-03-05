using System.Linq;
using System.Threading.Tasks;

namespace RIAPP.DataService.Core.Types
{
    public class PerformQueryResult<TData>
    {
        public PerformQueryResult(IQueryable<TData> data, Task<int?> count)
        {
            Data = data;
            Count = count;
        }

        public readonly IQueryable<TData> Data;
        public readonly Task<int?> Count;
    }
}
