using RIAPP.DataService.DomainService.Interfaces;
using RIAPP.DataService.Mvc;
using RIAppDemo.BLL.DataServices;
using RIAppDemo.BLL.Utils;
using System.Web.Mvc;
using System.Web.SessionState;
using RIAPP.DataService.Utils.Extensions;
using System;

namespace RIAppDemo.Controllers
{
    [SessionState(SessionStateBehavior.Disabled)]
    public class RIAppDemoServiceEFController : DataServiceController<RIAppDemoServiceEF>, IHostAddrService
    {
        private string _userIPAddress;

        protected override IDomainService CreateDomainService(Action<IServiceOptions> args)
        {
            this._userIPAddress = this.Request.UserHostAddress;
            var service = base.CreateDomainService((options) => {
                //an example how to add external services to the data service
                //this service has one method to get an IP address of the client

                options.AddSingleton<IHostAddrService>(this);
            });
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