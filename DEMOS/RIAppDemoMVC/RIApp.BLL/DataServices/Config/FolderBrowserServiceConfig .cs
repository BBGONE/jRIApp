using Microsoft.Extensions.DependencyInjection;
using RIAPP.DataService.Utils.Extensions;
using RIAPP.DataService.Utils.Interfaces;
using System;
using System.Security.Principal;

namespace RIAppDemo.BLL.DataServices.Config
{
    public static class FolderBrowserServiceConfig
    {
        public static void AddFolderBrowser(this IServiceCollection services, Func<ISerializer> getSerializer, Func<IPrincipal> getUser)
        {
            services.AddDomainService<FolderBrowserService>(getSerializer, getUser);
        }
    }
}
