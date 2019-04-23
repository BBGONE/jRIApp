using Net451.Microsoft.Extensions.DependencyInjection;
using RIAPP.DataService.Core.CodeGen;
using RIAPP.DataService.Core.Config;
using RIAPP.DataService.EF2.Utils;
using System;
using System.Data.Entity;

namespace RIAPP.DataService.EF2
{
    public static class EFDomainServiceConfig
    {
        public static void AddEF2DomainService<TService, TDB>(this IServiceCollection services,
           Action<ServiceOptions> configure)
             where TService : EFDomainService<TDB>
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
