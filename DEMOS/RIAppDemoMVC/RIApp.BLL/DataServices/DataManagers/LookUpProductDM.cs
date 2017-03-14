using RIAPP.DataService.DomainService.Attributes;
using RIAPP.DataService.DomainService.Types;
using RIAppDemo.BLL.Models;
using RIAppDemo.DAL.EF;
using System.Linq;

namespace RIAppDemo.BLL.DataServices.DataManagers
{
    public class LookUpProductDM : AdWDataManager<LookUpProduct>
    {
        [Query]
        public QueryResult<LookUpProduct> ReadProductLookUp()
        {
            int? totalCount = null;
            var res = PerformQuery<Product>(ref totalCount)
                    .Select(p => new LookUpProduct {ProductID = p.ProductID, Name = p.Name});
            var queryResult = new QueryResult<LookUpProduct>(res, totalCount);
            return queryResult;
        }
    }
}