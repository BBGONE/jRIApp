using RIAPP.DataService.Annotations;
using RIAPP.DataService.Core.Security;
using RIAPP.DataService.Core.Types;
using RIAppDemo.DAL.EF;
using System;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;

namespace RIAppDemo.BLL.DataServices.DataManagers
{
    public class CustomerAddressDM : AdWDataManager<CustomerAddress>
    {
        [Query]
        public async Task<QueryResult<CustomerAddress>> ReadCustomerAddress()
        {
            var res = PerformQuery(null);
            return new QueryResult<CustomerAddress>(await res.Data.ToListAsync(), totalCount: null);
        }

        [Query]
        public async Task<QueryResult<CustomerAddress>> ReadAddressForCustomers(int[] custIDs)
        {
            int? totalCount = null;
            var res = await DB.CustomerAddresses.Where(ca => custIDs.Contains(ca.CustomerID)).ToListAsync();
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
            customeraddress.ModifiedDate = DateTime.Now;
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