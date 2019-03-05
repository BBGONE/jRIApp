using Net451.Microsoft.Extensions.DependencyInjection;
using RIAPP.DataService.Core.CodeGen;
using RIAPP.DataService.Core.Config;
using RIAPP.DataService.EF.Utils;
using System;

namespace RIAPP.DataService.EF
{
    public static class EFDomainServiceConfig
    {
        public static void AddEFDomainService<TService, TDB>(this IServiceCollection services,
           Action<ServiceOptions> configure)
             where TService : EFDomainService<TDB>
             where TDB : System.Data.Objects.ObjectContext
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
