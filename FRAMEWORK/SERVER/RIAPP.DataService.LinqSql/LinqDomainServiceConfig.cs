using Net451.Microsoft.Extensions.DependencyInjection;
using RIAPP.DataService.DomainService.CodeGen;
using RIAPP.DataService.DomainService.Config;
using RIAPP.DataService.LinqSql.Utils;
using RIAPP.DataService.Utils;
using RIAPP.DataService.Utils.Extensions;
using System;

namespace RIAPP.DataService.LinqSql
{
    public static class LinqDomainServiceConfig
    {
        public static void AddLinqDomainService<TService, TDB>(this IServiceCollection services,
           Action<ServiceOptions> configure)
             where TService : LinqForSqlDomainService<TDB>
             where TDB : System.Data.Linq.DataContext
        {
            services.AddDomainService<TService>((options) => {
                configure?.Invoke(options);
            });

            services.RemoveService(typeof(IValueConverter<TService>));
            services.AddScoped<IValueConverter<TService>, LinqValueConverter<TService>>();

            services.AddScoped<ICodeGenProviderFactory<TService>>((sp) => {
                return new CsharpProviderFactory<TService, TDB>();
            });
        }
    }
}
