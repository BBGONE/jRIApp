using Net451.Microsoft.Extensions.DependencyInjection;
using System;
using System.Linq;

namespace RIAPP.DataService.Utils.Extensions
{
    public static class ServiceCollectionEx
    {
        public static bool RemoveService<TService>(this IServiceCollection services)
           where TService : class
        {
            ServiceDescriptor[] toRemove = services.Where(sd => sd.ServiceType == typeof(TService)).ToArray();
            Array.ForEach(toRemove, sd => services.Remove(sd));
            return toRemove.Length > 0;
        }

        public static bool RemoveService(this IServiceCollection services, Type serviceType)
        {
            ServiceDescriptor[] toRemove = services.Where(sd => sd.ServiceType == serviceType).ToArray();
            Array.ForEach(toRemove, sd => services.Remove(sd));
            return toRemove.Length > 0;
        }

        public static void ReplaceSingleton<TService>(this IServiceCollection services, TService instance)
          where TService : class
        {
            services.RemoveService<TService>();
            services.AddSingleton<TService>(instance);
        }

        public static void ReplaceSingleton<TService, TImplementation>(this IServiceCollection services)
          where TService : class
          where TImplementation : class, TService
        {
            services.RemoveService<TService>();
            services.AddSingleton<TService, TImplementation>();
        }
    }
}
