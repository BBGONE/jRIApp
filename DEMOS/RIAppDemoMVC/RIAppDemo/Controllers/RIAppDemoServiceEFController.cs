using RIAPP.DataService.DomainService;
using RIAPP.DataService.DomainService.Interfaces;
using RIAPP.DataService.Mvc;
using RIAppDemo.BLL.DataServices;
using RIAppDemo.BLL.Utils;
using System.Web.Mvc;
using System.Web.SessionState;

namespace RIAppDemo.Controllers
{
    [SessionState(SessionStateBehavior.Disabled)]
    public class RIAppDemoServiceEFController : DataServiceController<RIAppDemoServiceEF>, IHostAddrService
    {
        private string _userIPAddress;

        protected override IDomainService CreateDomainService()
        {
            this._userIPAddress = this.Request.UserHostAddress;
            var args = new ServiceArgs(this.Serializer, this.User);
            //just as an example how to add external services to the data service
            //this service has one method to get an IP address of the client
            args.AddSingleton<IHostAddrService>(this);
            var service = (RIAppDemoServiceEF)base.CreateDomainService(args);
            return service;
        }

        [ChildActionOnly]
        public string ProductModelData()
        {
            var info = GetDomainService().GetQueryData("ProductModel", "ReadProductModel");
            return Serializer.Serialize(info);
        }

        [ChildActionOnly]
        public string ProductCategoryData()
        {
            var info = GetDomainService().GetQueryData("ProductCategory", "ReadProductCategory");
            return Serializer.Serialize(info);
        }

        string IHostAddrService.GetIPAddress()
        {
            return this._userIPAddress;
        }
    }
}