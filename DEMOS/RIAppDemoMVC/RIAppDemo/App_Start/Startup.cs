using Microsoft.Extensions.DependencyInjection;
using RIAPP.DataService.Utils.Interfaces;
using RIAppDemo.BLL;
using RIAppDemo.BLL.DataServices.Config;
using RIAppDemo.BLL.Utils;
using RIAppDemo.Utils;
using System;
using System.Linq;
using System.Security.Principal;
using System.Threading;
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


            Func<IPrincipal> getCurrentUser = () =>
            {
                return Thread.CurrentPrincipal;
            };

            Func<ISerializer> getSerializer = () =>
            {
                return new Serializer();
            };

            services.AddSingleton<DBConnectionFactory>();
            services.AddThumbnailService();
            services.AddFolderBrowser(getSerializer, getCurrentUser);
            services.AddRIAppDemoService(getSerializer, getCurrentUser);
        }

    }
}