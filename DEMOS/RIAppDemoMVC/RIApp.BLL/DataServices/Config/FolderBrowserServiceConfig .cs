using Net451.Microsoft.Extensions.DependencyInjection;
using RIAPP.DataService.DomainService.Config;
using System;

namespace RIAppDemo.BLL.DataServices.Config
{
    public static class FolderBrowserServiceConfig
    {
        public static void AddFolderBrowser(this IServiceCollection services,
           Action<SvcOptions> configure)
        {
            services.AddDomainService<FolderBrowserService>((options) => {
                var svcOptions = new SvcOptions();
                configure?.Invoke(svcOptions);

                options.UserFactory = svcOptions.GetUser;
                options.SerializerFactory = svcOptions.GetSerializer;
            });
        }
    }
}
