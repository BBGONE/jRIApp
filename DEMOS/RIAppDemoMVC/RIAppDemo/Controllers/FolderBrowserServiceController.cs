using System.Web.Mvc;
using System.Web.SessionState;
using RIAppDemo.BLL.DataServices;
using RIAPP.DataService.Mvc;

namespace RIAppDemo.Controllers
{
    [SessionState(SessionStateBehavior.Disabled)]
    public class FolderBrowserServiceController : DataServiceController<FolderBrowserService>
    {

        public FolderBrowserServiceController(FolderBrowserService domainService): 
            base(domainService)
        {

        }
    }
}