using System.Security.Principal;
using RIAppDemo.BLL.Utils;
using RIAPP.DataService.DomainService;

namespace RIAppDemo.BLL.DataServices
{
    public static class ThumbnailServiceFactory
    {
        public static IThumbnailService Create(IPrincipal user)
        {
            var args = new ServiceArgs(new Serializer(), user);
            var svc = new RIAppDemoServiceEF(args);
            return svc;
        }
    }
}