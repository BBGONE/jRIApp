using System.Web.Mvc;
using System.Web.Routing;

namespace RIAppDemo
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.MapRoute(
                "Assets",
                "asset/{bust}/{min}/{*path}",
                new {controller = "Assets", action = "Index"}
                );

            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
                "Default", // Route name
                "{controller}/{action}/{id}", // URL with parameters
                new {controller = "Demo", action = "Index", id = UrlParameter.Optional} // Parameter defaults
                );
        }
    }
}