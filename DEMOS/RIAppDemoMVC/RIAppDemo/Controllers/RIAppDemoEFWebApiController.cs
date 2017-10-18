using System;
using RIAPP.DataService.DomainService;
using RIAPP.DataService.WebApi;
using RIAppDemo.BLL.DataServices;
using RIAppDemo.BLL.Utils;
using RIAPP.DataService.DomainService.Interfaces;
using RIAPP.DataService.Utils.Extensions;

namespace RIAppDemo.Controllers
{
    public class RIAppDemoEFWebApiController : BaseWebApiController<RIAppDemoServiceEF>, IHostAddrService
    {
        protected override RIAppDemoServiceEF CreateDomainService(Action<IServiceOptions> args)
        {
            var service = base.CreateDomainService((options) => {
               //an example how to add external services to the data service
               //this service has one method to get an IP address of the client

                options.AddSingleton<IHostAddrService>(this);
            });
            return service;
        }

        string IHostAddrService.GetIPAddress()
        {
            var clientAddress = System.Web.HttpContext.Current.Request.UserHostAddress;
            return clientAddress;
        }
    }
}
