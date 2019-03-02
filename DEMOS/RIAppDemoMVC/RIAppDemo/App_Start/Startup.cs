using Net451.Microsoft.Extensions.DependencyInjection;
using RIAPP.DataService.DomainService.CodeGen;
using RIAPP.DataService.Utils;
using RIAppDemo.BLL;
using RIAppDemo.BLL.DataServices.Config;
using RIAppDemo.BLL.Utils;
using RIAppDemo.Utils;
using System;
using System.Linq;
using System.Security.Principal;
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


            Func<IServiceProvider, IPrincipal> getCurrentUser = (sp) =>
            {
                return HttpContext.Current?.User;
            };

            Func<IServiceProvider, ISerializer> getSerializer = (sp) =>
            {
                return new Serializer();
            };

            services.AddSingleton<ICodeGenConfig, CodeGenConfig>();
            services.AddSingleton<DBConnectionFactory>();
            services.AddThumbnailService();
            services.AddFolderBrowser((options) => {
                options.GetSerializer = getSerializer;
                options.GetUser = getCurrentUser;
            });
            services.AddRIAppDemoService((options) => {
                options.GetSerializer = getSerializer;
                options.GetUser = getCurrentUser;
            });
        }

    }
}