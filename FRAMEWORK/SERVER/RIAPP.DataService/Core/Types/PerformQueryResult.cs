using System;
using System.Linq;
using System.Threading.Tasks;

namespace RIAPP.DataService.Core.Types
{
    public class PerformQueryResult<TData>
    {
        public PerformQueryResult(IQueryable<TData> data, Func<Task<int?>> count)
        {
            Data = data;
            CountAsync = count;
        }

        public readonly IQueryable<TData> Data;
        public readonly Func<Task<int?>> CountAsync;
    }
}
