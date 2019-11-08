using RIAPP.DataService.Annotations;
using RIAPP.DataService.Core.Query;
using RIAPP.DataService.Core.Security;
using RIAPP.DataService.Core.Types;
using RIAppDemo.DAL.EF;
using System;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;

namespace RIAppDemo.BLL.DataServices.DataManagers
{
    public class ProductDM : AdWDataManager<Product>
    {
        [Query]
        public async Task<QueryResult<Product>> ReadProduct(int[] param1, string param2)
        {
            // var queryInfo = RequestContext.CurrentQueryInfo;
            var productsResult = PerformQuery((countQuery) => countQuery.CountAsync());
            int? totalCount = await productsResult.CountAsync();
            var productsList = await productsResult.Data.ToListAsync();

            var productIDs = productsList.Select(p => p.ProductID).Distinct().ToArray();
            var queryResult = new QueryResult<Product>(productsList, totalCount);

            var subResult = new SubResult
            {
                dbSetName = "SalesOrderDetail",
                Result = await DB.SalesOrderDetails.AsNoTracking().Where(sod => productIDs.Contains(sod.ProductID)).ToListAsync()
            };

            // include related SalesOrderDetails with the products in the same query result
            queryResult.subResults.Add(subResult);
            // example of returning out of band information and use it on the client (of it can be more useful than it)
            queryResult.extraInfo = new {test = "ReadProduct Extra Info: " + DateTime.Now.ToString("dd.MM.yyyy HH:mm:ss")};
            return queryResult;
        }

        [Query]
        public async Task<QueryResult<Product>> ReadProductByIds(int[] productIDs)
        {
            var res = await DB.Products.Where(ca => productIDs.Contains(ca.ProductID)).ToListAsync();
            return new QueryResult<Product>(res, totalCount: null);
        }

        [Authorize(Roles = new[] {ADMINS_ROLE})]
        public override void Insert(Product product)
        {
            product.ModifiedDate = DateTime.Now;
            product.rowguid = Guid.NewGuid();
            DB.Products.Add(product);
        }

        [Authorize(Roles = new[] {ADMINS_ROLE})]
        public override void Update(Product product)
        {
            product.ModifiedDate = DateTime.Now;
            var orig = GetOriginal();
            DB.Products.Attach(product);
            DB.Entry(product).OriginalValues.SetValues(orig);
        }

        [Authorize(Roles = new[] {ADMINS_ROLE})]
        public override void Delete(Product product)
        {
            DB.Products.Attach(product);
            DB.Products.Remove(product);
        }

        [Refresh]
        public async Task<Product> RefreshProduct(RefreshInfoRequest refreshInfo)
        {
            var query = DataService.GetRefreshedEntityQuery(DB.Products, refreshInfo);
            return await query.SingleAsync();
        }
    }
}