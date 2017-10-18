using System.Security.Principal;
using RIAppDemo.BLL.Utils;
using RIAPP.DataService.DomainService;

namespace RIAppDemo.BLL.DataServices
{
    public static class ThumbnailServiceFactory
    {
        public static IThumbnailService Create(IPrincipal user)
        {
            var svc = new RIAppDemoServiceEF((options) => {
                options.Serializer = new Serializer();
                options.User = user;
            });
            return svc;
        }
    }
}