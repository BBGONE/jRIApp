using System;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;
using RIAppDemo.DAL.EF;
using RIAPP.DataService.DomainService.Attributes;
using RIAPP.DataService.DomainService.Security;
using RIAPP.DataService.DomainService.Types;
using RIAPP.DataService.Utils.Extensions;

namespace RIAppDemo.BLL.DataServices.DataManagers
{
    public class ProductDM : AdWDataManager<Product>
    {
        /// <summary>
        ///     The method can be asynchronous if instead of QueryResult
        ///     <Product>
        ///         type
        ///         you return Task<QueryResult
        ///         <Product>
        ///             >
        ///             the demo shows the asynchronous variant
        /// </summary>
        /// <param name="param1"></param>
        /// <param name="param2"></param>
        /// <returns></returns>
        [Query]
        public async Task<QueryResult<Product>> ReadProduct(int[] param1, string param2)
        {
            int? totalCount = null;
            var qinf = RequestContext.CurrentQueryInfo;
            //the async delay is for the demo purposes to make it more  complex
            //await Task.Delay(5000).ConfigureAwait(false);

            //another async part
            var productsArr = await PerformQuery(ref totalCount).ToArrayAsync();
            var productIDs = productsArr.Select(p => p.ProductID).Distinct().ToArray();
            var queryResult = new QueryResult<Product>(productsArr, totalCount);

            //the last async part
            var subResult = new SubResult
            {
                dbSetName = "SalesOrderDetail",
                Result = await DB.SalesOrderDetails.AsNoTracking().Where(sod => productIDs.Contains(sod.ProductID)).ToArrayAsync()
            };

            //include related SalesOrderDetails with the products in the same query result
            queryResult.subResults.Add(subResult);
            //example of returning out of band information and use it on the client (of it can be more useful than it)
            queryResult.extraInfo = new {test = "ReadProduct Extra Info: " + DateTime.Now.ToString("dd.MM.yyyy HH:mm:ss")};
            return queryResult;
        }

        [Query]
        public QueryResult<Product> ReadProductByIds(int[] productIDs)
        {
            int? totalCount = null;
            var res = DB.Products.Where(ca => productIDs.Contains(ca.ProductID));
            return new QueryResult<Product>(res, totalCount);
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

        /// <summary>
        ///     This is just a demo which shows that you can return Task
        ///     <Product>
        ///         type from this method
        ///         instead of simply returning the Product type (async execution)
        /// </summary>
        /// <param name="refreshInfo"></param>
        /// <returns>Product or Task<Product></returns>
        [Refresh]
        public Task<Product> RefreshProduct(RefreshInfo refreshInfo)
        {
            return Task.Run(() => { return DataService.GetRefreshedEntity(DB.Products, refreshInfo); });
        }
    }
}