using Net451.Microsoft.Extensions.DependencyInjection;
using RIAPP.DataService.Core.CodeGen;
using RIAPP.DataService.Utils;
using RIAppDemo.BLL;
using RIAppDemo.BLL.DataServices.Config;
using RIAppDemo.BLL.Utils;
using RIAppDemo.Utils;
using System;
using System.Linq;
using System.Security.Claims;
using System.Web;
using System.Web.Mvc;

namespace RIAppDemo
{
    public static class Startup
    {
        public static void ConfigureServices(IServiceCollection services)
        {
            services.AddControllersAsServices(typeof(MvcApplication).Assembly.GetExportedTypes()
            .Where(t => !t.IsAbstract && !t.IsGenericTypeDefinition)
            .Where(t => typeof(IController).IsAssignableFrom(t)
            || t.Name.EndsWith("Controller", StringComparison.OrdinalIgnoreCase)));


            Func<IServiceProvider, ClaimsPrincipal> getCurrentUser = (sp) =>
            {
                return (HttpContext.Current?.User as ClaimsPrincipal)?? new ClaimsPrincipal(new ClaimsIdentity(null, Enumerable.Empty<Claim>()));
            };

            services.AddSingleton<ICodeGenConfig, CodeGenConfig>();
            services.AddSingleton<ISerializer, Serializer>();
            services.AddSingleton<DBConnectionFactory>();

            services.AddThumbnailService();
            services.AddFolderBrowser((options) => {
                options.GetUser = getCurrentUser;
            });
            services.AddRIAppDemoService((options) => {
                options.GetUser = getCurrentUser;
            });
        }

    }
}