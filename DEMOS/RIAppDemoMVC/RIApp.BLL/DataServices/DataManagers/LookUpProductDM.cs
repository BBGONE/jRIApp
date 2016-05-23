using System.Linq;
using System.Threading.Tasks;
using RIAppDemo.BLL.Models;
using RIAppDemo.DAL.EF;
using RIAPP.DataService.DomainService.Attributes;
using RIAPP.DataService.DomainService.Types;

namespace RIAppDemo.BLL.DataServices.DataManagers
{
    public class LookUpProductDM : AdWDataManager<LookUpProduct>
    {
        [Query]
        public Task<QueryResult<LookUpProduct>> ReadProductLookUp()
        {
            int? totalCount = null;
            var res =
                PerformQuery<Product>(ref totalCount)
                    .Select(p => new LookUpProduct {ProductID = p.ProductID, Name = p.Name})
                    .AsEnumerable();
            var queryResult = new QueryResult<LookUpProduct>(res, totalCount);
            return Task.FromResult(queryResult);
        }
    }
}