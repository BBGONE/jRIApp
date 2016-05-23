using System.Web.Http;

namespace RIAppDemo
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            // Attribute routing.
            config.MapHttpAttributeRoutes();


            config.Routes.MapHttpRoute(
                "ApiByAction",
                "api/{controller}/{action}",
                new {action = "Get"}
                );


            config.Routes.MapHttpRoute(
                "DefaultAPI",
                "api/{controller}/{id}",
                new {id = RouteParameter.Optional}
                );


            config.Routes.MapHttpRoute(
                "ApiById",
                "api/{controller}/{action}/{id}",
                new {id = RouteParameter.Optional},
                new {id = @"^[0-9\-]+$"}
                );

            config.Routes.MapHttpRoute(
                "ApiByName",
                "api/{controller}/{action}/{name}",
                null,
                new {name = @"^[a-z]+$"}
                );
        }
    }
}