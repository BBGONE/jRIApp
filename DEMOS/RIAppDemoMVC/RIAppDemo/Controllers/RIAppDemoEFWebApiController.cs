using RIAPP.DataService.DomainService;
using RIAPP.DataService.WebApi;
using RIAppDemo.BLL.DataServices;
using RIAppDemo.BLL.Utils;

namespace RIAppDemo.Controllers
{
    public class RIAppDemoEFWebApiController : BaseWebApiController<RIAppDemoServiceEF>, IHostAddrService
    {
        protected override RIAppDemoServiceEF CreateDomainService()
        {
            var args = new ServiceArgs(this.Serializer, this.User);
            //just as an example how to add external services to the data service
            //this service has one method to get an IP address of the client
            args.AddSingleton<IHostAddrService>(this);
            var service = base.CreateDomainService(args);
            return service;
        }

        string IHostAddrService.GetIPAddress()
        {
            var clientAddress = System.Web.HttpContext.Current.Request.UserHostAddress;
            return clientAddress;
        }
    }
}