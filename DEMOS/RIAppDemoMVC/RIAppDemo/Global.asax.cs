using System;
using System.Security.Principal;
using System.Threading;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;

namespace RIAppDemo
{
    public class MvcApplication : HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();

            GlobalConfiguration.Configure(WebApiConfig.Register);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);

            BundleConfig.RegisterBundles(BundleTable.Bundles);
            BundleTable.EnableOptimizations = true;
        }

        protected void Application_AuthenticateRequest(object sender, EventArgs e)
        {
            var isNoRoles = false;
            IIdentity identity = new GenericIdentity("DUMMY_USER", "form");
            IPrincipal dummyUser = new GenericPrincipal(identity, isNoRoles ? new string[0] : new[] {"Users", "Admins"});
            HttpContext.Current.User = Thread.CurrentPrincipal = dummyUser;
        }
    }
}