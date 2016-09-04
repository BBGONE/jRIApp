using RIAPP.DataService.LinqSql;
using RIAppDemo.BLL.Models;
using RIAppDemo.BLL.Utils;
using RIAppDemo.DAL;
using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Data.Linq;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Transactions;
using System.Threading.Tasks;
using RIAPP.DataService.DomainService.Attributes;
using RIAPP.DataService.DomainService.Interfaces;
using RIAPP.DataService.DomainService.Security;
using RIAPP.DataService.DomainService.Types;
using RIAPP.DataService.Utils.Extensions;
using SortOrder = RIAPP.DataService.DomainService.Types.SortOrder;
using RIAPP.DataService.Utils.CodeGen;

namespace RIAppDemo.BLL.DataServices
{
    [Authorize()]
    public class RIAppDemoService : LinqForSqlDomainService<RIAppDemoDataContext>
    {
        private DbConnection _connection;
        private const string USERS_ROLE = "Users";
        private const string ADMINS_ROLE = "Admins";

        public RIAppDemoService(IServiceArgs args)
            : base(args)
        {
        }

        protected override RIAppDemoDataContext CreateDataContext()
        {
            if (this._connection == null)
                this._connection = DBConnectionFactory.GetRIAppDemoConnection();
            var db = new RIAppDemoDataContext(this._connection);
            return db;
        }

        protected override Metadata GetMetadata(bool isDraft)
        {
            if (isDraft)
            {
                //returns raw (uncorrected) programmatically generated metadata from LinqToSQL classes
                return base.GetMetadata(true);
            }
            else
            {
                //first the uncorrected metadata was saved into xml file and then edited 
                return Metadata.FromXML(RIAppDemo.BLL.Utils.ResourceHelper.GetResourceString("RIAppDemo.BLL.Metadata.MainDemo.xml"));
            }
        }

        protected override void ConfigureCodeGen()
        {
            base.ConfigureCodeGen();
            this.AddOrReplaceCodeGen("ts", () => new TypeScriptProvider(this, new[] { typeof(TestModel), typeof(KeyVal),
                typeof(StrKeyVal), typeof(RadioVal), typeof(HistoryItem), typeof(TestEnum2)
            }));
            //it allows getting information via GetCSharp, GetXAML, GetTypeScript
            //it should be set to false in release version 
            //allow it only at development time
            this.IsCodeGenEnabled = true;
        }


        #region Product
        [Query]
        public Task<QueryResult<LookUpProduct>> ReadProductLookUp()
        {
            int? totalCount = null;
            var res = this.PerformQuery(this.DB.Products, ref totalCount).Select(p => new LookUpProduct { ProductID = p.ProductID, Name = p.Name }).AsEnumerable();
            var queryResult = new QueryResult<LookUpProduct>(res, totalCount);
            return Task.FromResult(queryResult);
        }

        /// <summary>
        /// The method can be asynchronous if instead of QueryResult<Product> type
        /// you return Task<QueryResult<Product>>
        /// the demo shows the asynchronous variant
        /// </summary>
        /// <param name="param1"></param>
        /// <param name="param2"></param>
        /// <returns></returns>
        [Query]
        public async Task<QueryResult<Product>> ReadProduct(int[] param1, string param2)
        {
            int? totalCount = null;
            //the async delay is for the demo purposes to make it more  complex
            //await Task.Delay(250).ConfigureAwait(false);

            //another async part (simulate async query execution)
            var products = await Task.Run<IQueryable<Product>>(() =>
            {
                return this.PerformQuery(this.DB.Products,  ref totalCount);
            }).ConfigureAwait(false);

            var productsArr = products.ToArray();
            var productIDs = productsArr.Select(p => p.ProductID).Distinct().ToArray();
            var queryResult = new QueryResult<Product>(productsArr, totalCount);

            //the async delay is for the demo purposes to make it more  complex
            //await Task.Delay(250).ConfigureAwait(false);

            //the last async part
            var subResult = await Task.Run<SubResult>(() =>
            {
                return new SubResult() { dbSetName = "SalesOrderDetail", Result = this.DB.SalesOrderDetails.Where(sod => productIDs.Contains(sod.ProductID)) };
            }).ConfigureAwait(false);

            //include related SalesOrderDetails with the products in the same query result
            queryResult.subResults.Add(subResult);
           //example of returning out of band information and use it on the client (of it can be more useful than it)
            queryResult.extraInfo = new { test = "ReadProduct Extra Info: " + DateTime.Now.ToString("dd.MM.yyyy HH:mm:ss") };
            return queryResult;
        }

        [Query]
        public QueryResult<Product> ReadProductByIds(int[] productIDs)
        {
            int? totalCount = null;
            var res = this.DB.Products.Where(ca => productIDs.Contains(ca.ProductID));
            return new QueryResult<Product>(res, totalCount);
        }

        /// <summary>
        /// The method can be asynchronous if instead of IEnumerable<ValidationErrorInfo> type
        /// you return Task<IEnumerable<ValidationErrorInfo>>
        /// the demo shows the asynchronous variant
        /// </summary>
        /// <param name="product"></param>
        /// <param name="modifiedField"></param>
        /// <returns></returns>
        [Validate]
        public Task<IEnumerable<ValidationErrorInfo>> ValidateProduct(Product product, string[] modifiedField)
        {
            LinkedList<ValidationErrorInfo> errors = new LinkedList<ValidationErrorInfo>();
            if (Array.IndexOf(modifiedField,"Name") >-1 && product.Name.StartsWith("Ugly",StringComparison.OrdinalIgnoreCase))
                errors.AddLast(new ValidationErrorInfo{ fieldName="Name", message="Ugly name" });
            if (Array.IndexOf(modifiedField, "Weight") > -1 && product.Weight > 20000)
                errors.AddLast(new ValidationErrorInfo { fieldName = "Weight", message = "Weight must be less than 20000" });
            if (Array.IndexOf(modifiedField, "SellEndDate") > -1 && product.SellEndDate < product.SellStartDate)
                errors.AddLast(new ValidationErrorInfo { fieldName = "SellEndDate", message = "SellEndDate must be after SellStartDate" });
            if (Array.IndexOf(modifiedField, "SellStartDate") > -1 && product.SellStartDate > DateTime.Today)
                errors.AddLast(new ValidationErrorInfo { fieldName = "SellStartDate", message = "SellStartDate must be prior today" });

            return Task.FromResult<IEnumerable<ValidationErrorInfo>>(errors);
        }

        [Authorize(Roles = new string[]{ADMINS_ROLE})]
        [Insert]
        public void InsertProduct(Product product)
        {
            product.ModifiedDate = DateTime.Now;
            product.rowguid = Guid.NewGuid();
            this.DB.Products.InsertOnSubmit(product);
        }
        /// <summary>
        /// just for testing: OverrideAuthorize atrribute here says - check only access rights for this method (and skip dataservice's Authorize attribute)
        /// </summary>
        /// <param name="product"></param>
        [OverrideAuthorize(Roles = new string[] { ADMINS_ROLE })]
        [Update]
        public void UpdateProduct(Product product)
        {
            Product orig = this.GetOriginal<Product>();
            this.DB.Products.Attach(product, orig);
        }

        [Authorize(Roles = new string[] { ADMINS_ROLE })]
        [Delete]
        public void DeleteProduct(Product product)
        {
            this.DB.Products.Attach(product);
            this.DB.Products.DeleteOnSubmit(product);
        }

        /// <summary>
        /// This is just a demo that you can return Task<Product> type from this method
        /// instead of simply returning the Product type
        /// </summary>
        /// <param name="refreshInfo"></param>
        /// <returns>Product or Task<Product></returns>
        [Refresh]
        public Task<Product> RefreshProduct(RefreshInfo refreshInfo)
        {
            return Task.Run<Product>(() =>
            {
                return this.GetRefreshedEntity<Product>(this.DB.Products, refreshInfo);
            });
        }
        #endregion

        #region SalesOrderHeader
        [Query]
        public QueryResult<SalesOrderHeader> ReadSalesOrderHeader()
        {
            int? totalCount = null;
            var res = this.PerformQuery(this.DB.SalesOrderHeaders,  ref totalCount).AsEnumerable();
            return new QueryResult<SalesOrderHeader>(res, totalCount);
        }

        [Authorize(Roles = new string[] { ADMINS_ROLE })]
        [Insert]
        public void InsertSalesOrderHeader(SalesOrderHeader soHeader)
        {
            soHeader.ModifiedDate = DateTime.Now;
            soHeader.rowguid = Guid.NewGuid();
            this.DB.SalesOrderHeaders.InsertOnSubmit(soHeader);
        }

        [Authorize(Roles = new string[] { ADMINS_ROLE })]
        [Update]
        public void UpdateSalesOrderHeader(SalesOrderHeader soHeader)
        {
            SalesOrderHeader orig = this.GetOriginal<SalesOrderHeader>();
            this.DB.SalesOrderHeaders.Attach(soHeader, orig);
        }

        [Authorize(Roles = new string[] { ADMINS_ROLE })]
        [Delete]
        public void DeleteSalesOrderHeader(SalesOrderHeader soHeader)
        {
            this.DB.SalesOrderHeaders.Attach(soHeader);
            this.DB.SalesOrderHeaders.DeleteOnSubmit(soHeader);
        }
        #endregion

        #region SalesOrderDetail
       
        [Query]
        public QueryResult<SalesOrderDetail> ReadSalesOrderDetail()
        {
            int? totalCount = null;
            var res = this.PerformQuery(this.DB.SalesOrderDetails,  ref totalCount).AsEnumerable();
            return new QueryResult<SalesOrderDetail>(res, totalCount);
        }

        [Authorize(Roles = new string[] { ADMINS_ROLE })]
        [Insert]
        public void InsertSalesOrderDetail(SalesOrderDetail soDetail)
        {
            soDetail.ModifiedDate = DateTime.Now;
            soDetail.rowguid = Guid.NewGuid();
            this.DB.SalesOrderDetails.InsertOnSubmit(soDetail);
        }

        [Authorize(Roles = new string[] { ADMINS_ROLE })]
        [Update]
        public void UpdateSalesOrderDetail(SalesOrderDetail soDetail)
        {
            SalesOrderDetail orig = this.GetOriginal<SalesOrderDetail>();
            this.DB.SalesOrderDetails.Attach(soDetail, orig);
        }

        [Authorize(Roles = new string[] { ADMINS_ROLE })]
        [Delete]
        public void DeleteSalesOrderDetail(SalesOrderDetail soDetail)
        {
            this.DB.SalesOrderDetails.Attach(soDetail);
            this.DB.SalesOrderDetails.DeleteOnSubmit(soDetail);
        }
        #endregion

        [AllowAnonymous()]
        [Query]
        public QueryResult<ProductCategory> ReadProductCategory()
        {
            int? totalCount = null;
            var res = this.PerformQuery(this.DB.ProductCategories,  ref totalCount).AsEnumerable();
            return new QueryResult<ProductCategory>(res, totalCount);
        }

        [AllowAnonymous()]
        [Query]
        public QueryResult<ProductModel> ReadProductModel()
        {
            int? totalCount = null;
            var res = this.PerformQuery(this.DB.ProductModels,  ref totalCount).AsEnumerable();
            return new QueryResult<ProductModel>(res, totalCount);
        }

        /// <summary>
        /// if you return Task<SomeType> result from the Invoke method then it will be asynchronous
        /// if instead you return SomeType type then the method will be executed synchronously
        /// here i use the asynchronous variant for demo purposes only!
        /// </summary>
        /// <param name="param1"></param>
        /// <param name="param2"></param>
        /// <returns></returns>
        [Invoke()]
        public Task<string> TestInvoke(byte[] param1, string param2)
        {
            return Task.Run<string>(() =>
            {
                StringBuilder sb = new StringBuilder();

                Array.ForEach(param1, (item) =>
                {
                    if (sb.Length > 0)
                        sb.Append(", ");
                    sb.Append(item);
                });

                /*
                int rand = (new Random(DateTime.Now.Millisecond)).Next(0, 999);
                if ((rand % 3) == 0)
                    throw new Exception("Error generated randomly for testing purposes. Don't worry! Try again.");
                */

                return string.Format("TestInvoke method invoked with<br/><br/><b>param1:</b> {0}<br/> <b>param2:</b> {1}", sb, param2);
            });
        }

        [Invoke()]
        public void TestComplexInvoke(AddressInfo info, KeyVal[] keys)
        {
            //p.s. do something with info and keys
        }

        #region Helper Methods
        public string GetThumbnail(int id, System.IO.Stream strm)
        {
            string fileName = this.DB.Products.Where(a => a.ProductID == id).Select(a => a.ThumbnailPhotoFileName).FirstOrDefault();
            if (string.IsNullOrEmpty(fileName))
                return "";
            System.Transactions.TransactionOptions top = new System.Transactions.TransactionOptions();
            top.Timeout = TimeSpan.FromSeconds(60);
            top.IsolationLevel = System.Transactions.IsolationLevel.Serializable;

            using (TransactionScope scope = new TransactionScope(TransactionScopeOption.Required, top))
            using (DbConnection conn = DBConnectionFactory.GetRIAppDemoConnection())
            {
                byte[] bytes = new byte[64 * 1024];

                string fldname = "ThumbNailPhoto";
                BlobStream bstrm = new BlobStream(conn as SqlConnection, "[SalesLT].[Product]", fldname, string.Format("WHERE [ProductID]={0}", id));
                bstrm.Open();
                int cnt = bstrm.Read(bytes, 0, bytes.Length);
                while (cnt > 0)
                {
                    strm.Write(bytes, 0, cnt);
                    cnt = bstrm.Read(bytes, 0, bytes.Length);
                }
                bstrm.Close();
                scope.Complete();
            }
            return fileName;
        }

        public void SaveThumbnail(int id, string fileName, System.IO.Stream strm)
        {
            var product = this.DB.Products.Where(a => a.ProductID == id).FirstOrDefault();
            if (product == null)
                throw new Exception("Product is not found");

            TransactionOptions topts = new System.Transactions.TransactionOptions();
            topts.Timeout = TimeSpan.FromSeconds(60);
            topts.IsolationLevel = System.Transactions.IsolationLevel.Serializable;
            using (TransactionScope trxScope = new TransactionScope(TransactionScopeOption.Required, topts))
            using (DbConnection conn = DBConnectionFactory.GetRIAppDemoConnection())
            {
                System.IO.BinaryReader br = new System.IO.BinaryReader(strm);
                byte[] bytes = br.ReadBytes(64 * 1024);
                string fldname = "ThumbNailPhoto";
                BlobStream bstrm = new BlobStream(conn as SqlConnection, "[SalesLT].[Product]", fldname, string.Format("WHERE [ProductID]={0}", id));
                bstrm.InitColumn();
                bstrm.Open();
                while (bytes != null && bytes.Length > 0)
                {
                    bstrm.Write(bytes, 0, bytes.Length);
                    bytes = br.ReadBytes(64 * 1024); ;
                }
                bstrm.Close();
                br.Close();
                trxScope.Complete();
            }

            product.ThumbnailPhotoFileName = fileName;
            this.DB.SubmitChanges();
        }

        public void SaveThumbnail2(int id, string fileName, Func<System.IO.Stream, Task> copy)
        {
            var product = this.DB.Products.Where(a => a.ProductID == id).FirstOrDefault();
            if (product == null)
                throw new Exception("Product is not found");

            TransactionOptions topts = new System.Transactions.TransactionOptions();
            topts.Timeout = TimeSpan.FromSeconds(60);
            topts.IsolationLevel = System.Transactions.IsolationLevel.Serializable;
            using (TransactionScope trxScope = new TransactionScope(TransactionScopeOption.Required, topts))
            using (DbConnection conn = DBConnectionFactory.GetRIAppDemoConnection())
            {
                string fldname = "ThumbNailPhoto";
                BlobStream bstrm = new BlobStream(conn as SqlConnection, "[SalesLT].[Product]", fldname, string.Format("WHERE [ProductID]={0}", id));
                bstrm.InitColumn();
                bstrm.Open();
                try
                {
                    if (!copy(bstrm).Wait(10000))
                        throw new Exception("Write stream timeout");
                }
                finally
                {
                    bstrm.Close();
                }
                trxScope.Complete();
            }

            product.ThumbnailPhotoFileName = fileName;
            this.DB.SubmitChanges();
        }
        #endregion

        //store last diffgram here
        private string _diffGramm;

        /// <summary>
        /// here can be tracked changes to the entities
        /// for example: product entity changes is tracked and can be seen here
        /// </summary>
        /// <param name="dbSetName"></param>
        /// <param name="changeType"></param>
        /// <param name="diffgram"></param>
        protected override void OnTrackChange(string dbSetName, ChangeType changeType, string diffgram)
        {
            //you can set a breakpoint here and to examine diffgram
            this._diffGramm = diffgram;
        }

        /// <summary>
        /// Error logging could be implemented here
        /// </summary>
        /// <param name="ex"></param>
        protected override void OnError(Exception ex)
        {

        }

        protected override void Dispose(bool isDisposing)
        {
            if (this._connection != null)
            {
                this._connection.Close();
                this._connection = null;
            }
           
            base.Dispose(isDisposing);
        }
    }
}
