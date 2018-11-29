using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using RIAPP.DataService.DomainService.Interfaces;
using RIAPP.DataService.Utils.Extensions;
using RIAPP.DataService.Utils.Interfaces;
using System;
using System.Security.Principal;

namespace RIAPP.DataService.LinqSql.Utils.Extensions
{
    public static class ServiceOptionsEx
    {
        public static void AddLinqDomainService<TService>(this IServiceCollection services, Func<ISerializer> getSerializer, Func<IPrincipal> getUser, Action<IServiceOptions> initOptions = null)
         where TService : BaseLinqForSqlDomainService
        {
            services.AddDomainService<TService>(getSerializer, getUser, (options)=> {
                options.RemoveAll(typeof(IValueConverter<TService>));
                services.TryAddScoped<IValueConverter<TService>, LinqValueConverter<TService>>();
                initOptions?.Invoke(options);
            });
        }
    }
}