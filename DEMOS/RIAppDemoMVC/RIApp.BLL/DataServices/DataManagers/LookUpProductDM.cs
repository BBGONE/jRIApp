using RIAPP.DataService.DomainService.Attributes;
using RIAPP.DataService.DomainService.Types;
using RIAppDemo.BLL.Models;
using RIAppDemo.DAL.EF;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;

namespace RIAppDemo.BLL.DataServices.DataManagers
{
    public class LookUpProductDM : AdWDataManager<LookUpProduct>
    {
        [Query]
        public async Task<QueryResult<LookUpProduct>> ReadProductLookUp()
        {
            var res = await PerformQuery<Product>(null).Data.Select(p => new LookUpProduct { ProductID = p.ProductID, Name = p.Name }).ToListAsync();
            return new QueryResult<LookUpProduct>(res, totalCount: null);
        }
    }
}