using System;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;
using RIAppDemo.DAL.EF;
using RIAPP.DataService.DomainService.Attributes;
using RIAPP.DataService.DomainService.Security;
using RIAPP.DataService.DomainService.Types;

namespace RIAppDemo.BLL.DataServices.DataManagers
{
    public class CustomerAddressDM : AdWDataManager<CustomerAddress>
    {
        [Query]
        public QueryResult<CustomerAddress> ReadCustomerAddress()
        {
            int? totalCount = null;
            var res = PerformQuery(ref totalCount);
            return new QueryResult<CustomerAddress>(res, totalCount);
        }

        [Query]
        public QueryResult<CustomerAddress> ReadAddressForCustomers(int[] custIDs)
        {
            int? totalCount = null;
            var res = DB.CustomerAddresses.Where(ca => custIDs.Contains(ca.CustomerID));
            return new QueryResult<CustomerAddress>(res, totalCount);
        }

        [Authorize(Roles = new[] {ADMINS_ROLE})]
        public override void Insert(CustomerAddress customeraddress)
        {
            customeraddress.ModifiedDate = DateTime.Now;
            customeraddress.rowguid = Guid.NewGuid();
            DB.CustomerAddresses.Add(customeraddress);
        }

        [Authorize(Roles = new[] {ADMINS_ROLE})]
        public override void Update(CustomerAddress customeraddress)
        {
            var orig = GetOriginal();
            DB.CustomerAddresses.Attach(customeraddress);
            DB.Entry(customeraddress).OriginalValues.SetValues(orig);
        }

        [Authorize(Roles = new[] {ADMINS_ROLE})]
        public override void Delete(CustomerAddress customeraddress)
        {
            DB.CustomerAddresses.Attach(customeraddress);
            DB.CustomerAddresses.Remove(customeraddress);
        }
    }
}