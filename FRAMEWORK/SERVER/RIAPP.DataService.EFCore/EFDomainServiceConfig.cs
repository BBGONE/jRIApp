using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using RIAPP.DataService.Core.Config;
using RIAPP.DataService.EFCore;
using RIAPP.DataService.EFCore.Utils;
using RIAPP.DataService.Core.CodeGen;
using System;

namespace RIAppDemo.BLL.DataServices.Config
{
    public static class EFDomainServiceConfig
    {
        public static void AddEFDomainService<TService, TDB>(this IServiceCollection services, 
           Action<ServiceOptions> configure)
             where TService: EFDomainService<TDB>
             where TDB : DbContext
        {
            services.AddDomainService<TService>((options) => {
                configure?.Invoke(options);
            });

            services.AddScoped<ICodeGenProviderFactory<TService>>((sp) => {
                return new CsharpProviderFactory<TService, TDB>();
            });
        }
    }
}
