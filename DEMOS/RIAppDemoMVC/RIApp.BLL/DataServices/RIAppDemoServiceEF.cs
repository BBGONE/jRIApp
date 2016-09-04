using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Data.Entity;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Transactions;
using RIAppDemo.BLL.DataServices.Config;
using RIAppDemo.BLL.Models;
using RIAppDemo.BLL.Utils;
using RIAppDemo.DAL.EF;
using RIAPP.DataService.DomainService.Attributes;
using RIAPP.DataService.DomainService.Config;
using RIAPP.DataService.DomainService.Interfaces;
using RIAPP.DataService.DomainService.Security;
using RIAPP.DataService.DomainService.Types;
using RIAPP.DataService.EF6_CF;
using RIAPP.DataService.Utils.Extensions;
using ResourceHelper = RIAppDemo.BLL.Utils.ResourceHelper;
using SortOrder = RIAPP.DataService.DomainService.Types.SortOrder;
using RIAPP.DataService.Utils.CodeGen;

namespace RIAppDemo.BLL.DataServices
{
    [Authorize]
    public class RIAppDemoServiceEF : EFDomainService<ADWDbContext>, IThumbnailService
    {
        internal const string USERS_ROLE = "Users";
        internal const string ADMINS_ROLE = "Admins";
        private DbConnection _connection;

        //store last diffgram here
        private string _diffGramm;

        public RIAppDemoServiceEF(IServiceArgs args)
            : base(args)
        {
            //it allows getting information via GetCSharp, GetXAML, GetTypeScript
            //it should be set to false in release version 
            //allow it only at development time
            this.IsCodeGenEnabled = true;
            this.AddOrReplaceCodeGen("ts", () => new TypeScriptProvider(this, new[] { typeof(TestModel), typeof(KeyVal),
                typeof(StrKeyVal), typeof(RadioVal), typeof(HistoryItem), typeof(TestEnum2)
            }));
        }

        protected override ADWDbContext CreateDataContext()
        {
            if (_connection == null)
                _connection = DBConnectionFactory.GetRIAppDemoConnection();
            var db = new ADWDbContext(_connection);
            return db;
        }

        protected override Metadata GetMetadata(bool isDraft)
        {
            if (isDraft)
            {
                //returns raw (uncorrected) programmatically generated metadata from LinqToSQL classes
                return base.GetMetadata(true);
            }
            //first the uncorrected metadata was saved into xml file and then edited 
            return Metadata.FromXML(ResourceHelper.GetResourceString("RIAppDemo.BLL.Metadata.MainDemo2.xml"));
        }

        protected override void Bootstrap(ServiceConfig config)
        {
            ValidatorConfig.RegisterValidators(config.ValidatorsContainer);
            DataManagerConfig.RegisterDataManagers(config.DataManagerContainer);
        }

        #region ProductModel

        [AllowAnonymous]
        [Query]
        public QueryResult<ProductModel> ReadProductModel()
        {
            int? totalCount = null;
            var res = this.PerformQuery(DB.ProductModels.AsNoTracking(), ref totalCount).AsEnumerable();
            return new QueryResult<ProductModel>(res, totalCount);
        }

        #endregion

        #region ProductCategory
        /// <summary>
        /// An example how to return query result of another type as entity
        /// Query attribute can contain information about the EntityType or DbSetName or both
        /// </summary>
        /// <returns>Query result</returns>
        [AllowAnonymous]
        [Query(DbSetName = "ProductCategory", EntityType = typeof(ProductCategory))]
        public QueryResult<object> ReadProductCategory()
        {
            int? totalCount = null;
            //we return anonymous type from query instead of real entities
            //the framework does not care about the real type of the returned entities as long as they contain all the fields
            var res = this.PerformQuery(DB.ProductCategories.AsNoTracking(), ref totalCount).Select(p =>
            new
            {
                ProductCategoryID = p.ProductCategoryID,
                ParentProductCategoryID = p.ParentProductCategoryID,
                Name = p.Name,
                rowguid = p.rowguid,
                ModifiedDate = p.ModifiedDate
            });
            return new QueryResult<object>(res, totalCount);
        }

        #endregion

        [Query]
        public QueryResult<SalesInfo> ReadSalesInfo()
        {
            var queryInfo = this.GetCurrentQueryInfo();
            var startsWithVal = queryInfo.filterInfo.filterItems[0].values.First().TrimEnd('%');
            var res =
                DB.Customers.AsNoTracking().Where(c => c.SalesPerson.StartsWith(startsWithVal))
                    .Select(s => s.SalesPerson)
                    .Distinct()
                    .OrderBy(s => s)
                    .Select(s => new SalesInfo {SalesPerson = s});
            var res2 = res.Skip(queryInfo.pageIndex*queryInfo.pageSize).Take(queryInfo.pageSize).ToArray();
            return new QueryResult<SalesInfo>(res2, res.Count());
        }

        [Query]
        public QueryResult<AddressInfo> ReadAddressInfo()
        {
            int? totalCount = null;
            var res =
                this.PerformQuery(DB.Addresses.AsNoTracking(), ref totalCount)
                    .Select(
                        a =>
                            new AddressInfo
                            {
                                AddressID = a.AddressID,
                                AddressLine1 = a.AddressLine1,
                                City = a.City,
                                CountryRegion = a.CountryRegion
                            })
                    .AsEnumerable();
            return new QueryResult<AddressInfo>(res, totalCount);
        }

        /// <summary>
        ///     if you return Task
        ///     <SomeType>
        ///         result from the Invoke method then it will be asynchronous
        ///         if instead you return SomeType type then the method will be executed synchronously
        ///         here i use the asynchronous variant for demo purposes only!
        /// </summary>
        /// <param name="param1"></param>
        /// <param name="param2"></param>
        /// <returns></returns>
        [AllowAnonymous]
        [Invoke]
        public Task<string> TestInvoke(byte[] param1, string param2)
        {
            return Task.Run(() =>
            {
                var sb = new StringBuilder();

                Array.ForEach(param1, item =>
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

                return
                    string.Format("TestInvoke method invoked with<br/><br/><b>param1:</b> {0}<br/> <b>param2:</b> {1}",
                        sb, param2);
            });
        }

        [Invoke]
        public void TestComplexInvoke(AddressInfo info, KeyVal[] keys)
        {
            //p.s. do something with info and keys
        }

        /// <summary>
        ///     here can be tracked changes to the entities
        ///     for example: product entity changes is tracked and can be seen here
        /// </summary>
        /// <param name="dbSetName"></param>
        /// <param name="changeType"></param>
        /// <param name="diffgram"></param>
        protected override void OnTrackChange(string dbSetName, ChangeType changeType, string diffgram)
        {
            //you can set a breakpoint here and to examine diffgram
            _diffGramm = diffgram;
        }
        
        /// <summary>
        ///     Error logging could be implemented here
        /// </summary>
        /// <param name="ex"></param>
        protected override void OnError(Exception ex)
        {
            var msg = "";
            if (ex != null)
                msg = ex.Message;
        }

        protected override void Dispose(bool isDisposing)
        {
            if (_connection != null)
            {
                _connection.Close();
                _connection = null;
            }

            base.Dispose(isDisposing);
        }

        #region Customer

        [Query]
        public QueryResult<Customer> ReadCustomer(bool? includeNav)
        {
            var includeHierarchy = new string[0];
            if (includeNav == true)
            {
                //we can conditionally include entity hierarchy into results
                //making the path navigations decisions on the server enhances security
                //we can not trust clients to define navigation's expansions because it can influence the server performance
                //and is not good from the security considerations
                includeHierarchy = new[] {"CustomerAddresses.Address"};
            }
            var customers = DB.Customers.AsNoTracking() as IQueryable<Customer>;
            var queryInfo = this.GetCurrentQueryInfo();
            //AddressCount does not exists in Database (we calculate it), so it is needed to sort it manually
            var addressCountSortItem = queryInfo.sortInfo.sortItems.FirstOrDefault(sortItem => sortItem.fieldName == "AddressCount");
            if (addressCountSortItem != null)
            {
                queryInfo.sortInfo.sortItems.Remove(addressCountSortItem);
                if (addressCountSortItem.sortOrder == SortOrder.ASC)
                    customers = customers.OrderBy(c => c.CustomerAddresses.Count());
                else
                    customers = customers.OrderByDescending(c => c.CustomerAddresses.Count());
            }

            //perform query
            int? totalCount = null;
            List<Customer> res = null;

            if (includeNav == true)
                res =   this.PerformQuery(customers, ref totalCount)
                        .Include(c => c.CustomerAddresses.Select(y => y.Address))
                        .ToList();
            else
                res = this.PerformQuery(customers, ref totalCount).ToList();


            //if we have preloaded customer addresses then update server side calculated field: AddressCount 
            //(which i had introduced for testing purposes)
            if (includeNav == true)
            {
                res.ForEach(customer => { customer.AddressCount = customer.CustomerAddresses.Count(); });
            }

            //return result
            return new QueryResult<Customer>(res, totalCount, includeHierarchy);
        }

        [Authorize(Roles = new[] {ADMINS_ROLE})]
        [Insert]
        public void InsertCustomer(Customer customer)
        {
            customer.PasswordHash = Guid.NewGuid().ToString();
            customer.PasswordSalt = new string(Guid.NewGuid().ToString().ToCharArray().Take(10).ToArray());
            customer.ModifiedDate = DateTime.Now;
            customer.rowguid = Guid.NewGuid();
            DB.Customers.Add(customer);
        }

        [Authorize(Roles = new[] {ADMINS_ROLE})]
        [Update]
        public void UpdateCustomer(Customer customer)
        {
            customer.ModifiedDate = DateTime.Now;
            var orig = this.GetOriginal<Customer>();
            DB.Customers.Attach(customer);
            DB.Entry(customer).OriginalValues.SetValues(orig);
        }

        [Authorize(Roles = new[] {ADMINS_ROLE})]
        [Delete]
        public void DeleteCustomer(Customer customer)
        {
            DB.Customers.Attach(customer);
            DB.Customers.Remove(customer);
        }

        [Refresh]
        public Customer RefreshCustomer(RefreshInfo refreshInfo)
        {
            return this.GetRefreshedEntity(DB.Customers, refreshInfo);
        }

        #endregion

        #region Address

        [Query]
        public QueryResult<Address> ReadAddress()
        {
            int? totalCount = null;
            var res = this.PerformQuery(DB.Addresses.AsNoTracking(), ref totalCount).AsEnumerable();
            return new QueryResult<Address>(res, totalCount);
        }

        [Query]
        public QueryResult<Address> ReadAddressByIds(int[] addressIDs)
        {
            int? totalCount = null;
            var res = DB.Addresses.AsNoTracking().Where(ca => addressIDs.Contains(ca.AddressID));
            return new QueryResult<Address>(res, totalCount);
        }

        [Validate]
        public IEnumerable<ValidationErrorInfo> ValidateAddress(Address address, string[] modifiedField)
        {
            return Enumerable.Empty<ValidationErrorInfo>();
        }

        [Authorize(Roles = new[] {ADMINS_ROLE})]
        [Insert]
        public void InsertAddress(Address address)
        {
            address.ModifiedDate = DateTime.Now;
            address.rowguid = Guid.NewGuid();
            DB.Addresses.Add(address);
        }

        [Authorize(Roles = new[] {ADMINS_ROLE})]
        [Update]
        public void UpdateAddress(Address address)
        {
            var orig = this.GetOriginal<Address>();
            DB.Addresses.Attach(address);
            DB.Entry(address).OriginalValues.SetValues(orig);
        }

        [Authorize(Roles = new[] {ADMINS_ROLE})]
        [Delete]
        public void DeleteAddress(Address address)
        {
            DB.Addresses.Attach(address);
            DB.Addresses.Remove(address);
        }

        #endregion

        #region SalesOrderHeader

        [Query]
        public QueryResult<SalesOrderHeader> ReadSalesOrderHeader()
        {
            int? totalCount = null;
            var res = this.PerformQuery(DB.SalesOrderHeaders.AsNoTracking(), ref totalCount).AsEnumerable();
            return new QueryResult<SalesOrderHeader>(res, totalCount);
        }

        [Authorize(Roles = new[] {ADMINS_ROLE})]
        [Insert]
        public void InsertSalesOrderHeader(SalesOrderHeader salesorderheader)
        {
            salesorderheader.ModifiedDate = DateTime.Now;
            salesorderheader.rowguid = Guid.NewGuid();
            DB.SalesOrderHeaders.Add(salesorderheader);
        }

        [Authorize(Roles = new[] {ADMINS_ROLE})]
        [Update]
        public void UpdateSalesOrderHeader(SalesOrderHeader salesorderheader)
        {
            var orig = this.GetOriginal<SalesOrderHeader>();
            DB.SalesOrderHeaders.Attach(salesorderheader);
            DB.Entry(salesorderheader).OriginalValues.SetValues(orig);
        }

        [Authorize(Roles = new[] {ADMINS_ROLE})]
        [Delete]
        public void DeleteSalesOrderHeader(SalesOrderHeader salesorderheader)
        {
            DB.SalesOrderHeaders.Attach(salesorderheader);
            DB.SalesOrderHeaders.Remove(salesorderheader);
        }

        #endregion

        #region SalesOrderDetail

        [Query]
        public QueryResult<SalesOrderDetail> ReadSalesOrderDetail()
        {
            int? totalCount = null;
            var res = this.PerformQuery(DB.SalesOrderDetails.AsNoTracking(), ref totalCount).AsEnumerable();
            return new QueryResult<SalesOrderDetail>(res, totalCount);
        }

        [Authorize(Roles = new[] {ADMINS_ROLE})]
        [Insert]
        public void InsertSalesOrderDetail(SalesOrderDetail salesorderdetail)
        {
            salesorderdetail.ModifiedDate = DateTime.Now;
            salesorderdetail.rowguid = Guid.NewGuid();
            DB.SalesOrderDetails.Add(salesorderdetail);
        }

        [Authorize(Roles = new[] {ADMINS_ROLE})]
        [Update]
        public void UpdateSalesOrderDetail(SalesOrderDetail salesorderdetail)
        {
            var orig = this.GetOriginal<SalesOrderDetail>();
            DB.SalesOrderDetails.Attach(salesorderdetail);
            DB.Entry(salesorderdetail).OriginalValues.SetValues(orig);
        }

        [Authorize(Roles = new[] {ADMINS_ROLE})]
        [Delete]
        public void DeleteSalesOrderDetail(SalesOrderDetail salesorderdetail)
        {
            DB.SalesOrderDetails.Attach(salesorderdetail);
            DB.SalesOrderDetails.Remove(salesorderdetail);
        }

        #endregion

        #region Helper Methods

        public string GetThumbnail(int id, Stream strm)
        {
            var fileName =
                DB.Products.Where(a => a.ProductID == id).Select(a => a.ThumbnailPhotoFileName).FirstOrDefault();
            if (string.IsNullOrEmpty(fileName))
                return "";
            var top = new TransactionOptions();
            top.Timeout = TimeSpan.FromSeconds(60);
            top.IsolationLevel = IsolationLevel.Serializable;

            using (var scope = new TransactionScope(TransactionScopeOption.Required, top))
            using (var conn = DBConnectionFactory.GetRIAppDemoConnection())
            {
                var bytes = new byte[64*1024];

                var fldname = "ThumbNailPhoto";
                var bstrm = new BlobStream(conn as SqlConnection, "[SalesLT].[Product]", fldname,
                    string.Format("WHERE [ProductID]={0}", id));
                bstrm.Open();
                var cnt = bstrm.Read(bytes, 0, bytes.Length);
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

        public void SaveThumbnail(int id, string fileName, Stream strm)
        {
            var product = DB.Products.Where(a => a.ProductID == id).FirstOrDefault();
            if (product == null)
                throw new Exception("Product is not found");

            var topts = new TransactionOptions();
            topts.Timeout = TimeSpan.FromSeconds(60);
            topts.IsolationLevel = IsolationLevel.Serializable;
            using (var trxScope = new TransactionScope(TransactionScopeOption.Required, topts))
            using (var conn = DBConnectionFactory.GetRIAppDemoConnection())
            {
                var br = new BinaryReader(strm);
                var bytes = br.ReadBytes(64*1024);
                var fldname = "ThumbNailPhoto";
                var bstrm = new BlobStream(conn as SqlConnection, "[SalesLT].[Product]", fldname,
                    string.Format("WHERE [ProductID]={0}", id));
                bstrm.InitColumn();
                bstrm.Open();
                while (bytes != null && bytes.Length > 0)
                {
                    bstrm.Write(bytes, 0, bytes.Length);
                    bytes = br.ReadBytes(64*1024);
                    ;
                }
                bstrm.Close();
                br.Close();
                trxScope.Complete();
            }

            product.ThumbnailPhotoFileName = fileName;
            DB.SaveChanges();
        }

        public void SaveThumbnail2(int id, string fileName, Func<Stream, Task> copy)
        {
            var product = DB.Products.Where(a => a.ProductID == id).FirstOrDefault();
            if (product == null)
                throw new Exception("Product is not found");

            var topts = new TransactionOptions();
            topts.Timeout = TimeSpan.FromSeconds(60);
            topts.IsolationLevel = IsolationLevel.Serializable;
            using (var trxScope = new TransactionScope(TransactionScopeOption.Required, topts))
            using (var conn = DBConnectionFactory.GetRIAppDemoConnection())
            {
                var fldname = "ThumbNailPhoto";
                var bstrm = new BlobStream(conn as SqlConnection, "[SalesLT].[Product]", fldname,
                    string.Format("WHERE [ProductID]={0}", id));
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
            DB.SaveChanges();
        }

        #endregion
    }
}