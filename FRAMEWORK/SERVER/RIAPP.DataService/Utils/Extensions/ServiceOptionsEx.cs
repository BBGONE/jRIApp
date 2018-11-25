using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using RIAPP.DataService.DomainService;
using RIAPP.DataService.DomainService.Config;
using RIAPP.DataService.DomainService.Interfaces;
using RIAPP.DataService.DomainService.Security;
using RIAPP.DataService.Resources;
using RIAPP.DataService.Utils.Interfaces;
using System;
using System.Security.Principal;

namespace RIAPP.DataService.Utils.Extensions
{
    public static class ServiceOptionsEx
    {
        public static void AddDomainService<TService>(this IServiceCollection services, Func<ISerializer> getSerializer, Func<IPrincipal> getUser, Action<IServiceOptions> initOptions = null)
         where TService : BaseDomainService
        {
            if (getSerializer == null)
                throw new ArgumentNullException(nameof(getSerializer), ErrorStrings.ERR_NO_SERIALIZER);
            if (getUser == null)
                throw new ArgumentNullException(nameof(getUser), ErrorStrings.ERR_NO_USER);

            services.TryAddScoped<ISerializer>((sp) => getSerializer());

            services.TryAddScoped<IPrincipal>((sp) => getUser());

            services.TryAddScoped<TService>();

            services.TryAddScoped<IAuthorizer<TService>, AuthorizerClass<TService>>();

            services.TryAddScoped<IValueConverter<TService>, ValueConverter<TService>>();

            services.TryAddScoped<IDataHelper<TService>, DataHelper<TService>>();

            services.TryAddScoped<IValidationHelper<TService>, ValidationHelper<TService>>();

            services.TryAddScoped<IServiceOperationsHelper<TService>, ServiceOperationsHelper<TService>>();

            var serviceConfig = new ServiceConfig();

            services.TryAddScoped<IServiceContainer<TService>>((sp) => new ServiceContainer<TService>(sp, serviceConfig));

            ServiceOptions options = new ServiceOptions(services, serviceConfig);

            initOptions?.Invoke(options);

            foreach (var descriptor in serviceConfig.DataManagerContainer.Descriptors)
            {
                services.TryAddScoped(descriptor.ServiceType, descriptor.ImplementationType);
            }

            foreach (var descriptor in serviceConfig.ValidatorsContainer.Descriptors)
            {
                services.TryAddScoped(descriptor.ServiceType, descriptor.ImplementationType);
            }
        }
    }
}