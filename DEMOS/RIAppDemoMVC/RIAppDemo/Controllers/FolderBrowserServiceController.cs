using RIAPP.DataService.Mvc;
using RIAppDemo.BLL.DataServices;
using System.Web.Mvc;
using System.Web.SessionState;

namespace RIAppDemo.Controllers
{
    [SessionState(SessionStateBehavior.Disabled)]
    public class FolderBrowserServiceController : DataServiceController<FolderBrowserService>
    {

        public FolderBrowserServiceController(FolderBrowserService domainService) :
            base(domainService)
        {

        }
    }
}