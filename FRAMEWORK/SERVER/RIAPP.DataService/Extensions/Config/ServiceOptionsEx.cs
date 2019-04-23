using Microsoft.Extensions.DependencyInjection.Extensions;
using System;

namespace RIAPP.DataService.Core.Config
{
    public static class ServiceOptionsEx
    {
        public static IServiceOptions RemoveAll<T>(this IServiceOptions serviceOptions)
        {
            serviceOptions.Services.RemoveAll<T>();
            return serviceOptions;
        }

        public static IServiceOptions RemoveAll(this IServiceOptions serviceOptions, Type serviceType)
        {
            serviceOptions.Services.RemoveAll(serviceType);
            return serviceOptions;
        }

        public static void TryAddScoped<TService>(this IServiceOptions serviceOptions, Func<IServiceProvider, TService> implementationFactory, bool replaceExisting = false)
            where TService : class
        {
            if (replaceExisting)
            {
                serviceOptions.RemoveAll<TService>();
            }
            serviceOptions.Services.TryAddScoped<TService>(implementationFactory);
        }

        public static void TryAddScoped<TService, TImplementation>(this IServiceOptions serviceOptions, bool replaceExisting = false)
            where TService : class
            where TImplementation : class, TService
        {
            if (replaceExisting)
            {
                serviceOptions.RemoveAll<TService>();
            }
            serviceOptions.Services.TryAddScoped<TService, TImplementation>();
        }

        public static void TryAddScoped(this IServiceOptions serviceOptions, Type service, Func<IServiceProvider, object> implementationFactory, bool replaceExisting = false)
        {
            if (replaceExisting)
            {
                serviceOptions.RemoveAll(service);
            }
            serviceOptions.Services.TryAddScoped(service, implementationFactory);
        }

        public static void TryAddScoped<TService>(this IServiceOptions serviceOptions, bool replaceExisting = false)
            where TService : class
        {
            if (replaceExisting)
            {
                serviceOptions.RemoveAll<TService>();
            }
            serviceOptions.Services.TryAddScoped<TService>();
        }

        public static void TryAddScoped(this IServiceOptions serviceOptions, Type service, bool replaceExisting = false)
        {
            if (replaceExisting)
            {
                serviceOptions.RemoveAll(service);
            }
            serviceOptions.Services.TryAddScoped(service);
        }

        public static void TryAddScoped(this IServiceOptions serviceOptions, Type service, Type implementationType, bool replaceExisting = false)
        {
            if (replaceExisting)
            {
                serviceOptions.RemoveAll(service);
            }
            serviceOptions.Services.TryAddScoped(service, implementationType);
        }

        public static void TryAddSingleton<TService>(this IServiceOptions serviceOptions, Func<IServiceProvider, TService> implementationFactory, bool replaceExisting = false)
            where TService : class
        {
            if (replaceExisting)
            {
                serviceOptions.RemoveAll<TService>();
            }
            serviceOptions.Services.TryAddSingleton<TService>(implementationFactory);
        }

        public static void TryAddSingleton<TService, TImplementation>(this IServiceOptions serviceOptions, bool replaceExisting = false)
            where TService : class
            where TImplementation : class, TService
        {
            if (replaceExisting)
            {
                serviceOptions.RemoveAll<TService>();
            }
            serviceOptions.Services.TryAddSingleton<TService, TImplementation>();
        }

        public static void TryAddSingleton(this IServiceOptions serviceOptions, Type service, Func<IServiceProvider, object> implementationFactory, bool replaceExisting = false)
        {
            if (replaceExisting)
            {
                serviceOptions.RemoveAll(service);
            }
            serviceOptions.Services.TryAddSingleton(service, implementationFactory);
        }

        public static void TryAddSingleton<TService>(this IServiceOptions serviceOptions, bool replaceExisting = false)
            where TService : class
        {
            if (replaceExisting)
            {
                serviceOptions.RemoveAll<TService>();
            }
            serviceOptions.Services.TryAddSingleton<TService>();
        }

        public static void TryAddSingleton(this IServiceOptions serviceOptions, Type service, bool replaceExisting = false)
        {
            if (replaceExisting)
            {
                serviceOptions.RemoveAll(service);
            }
            serviceOptions.Services.TryAddSingleton(service);
        }

        public static void TryAddSingleton(this IServiceOptions serviceOptions, Type service, Type implementationType, bool replaceExisting = false)
        {
            if (replaceExisting)
            {
                serviceOptions.RemoveAll(service);
            }
            serviceOptions.Services.TryAddSingleton(service, implementationType);
        }


        public static void TryAddTransient<TService>(this IServiceOptions serviceOptions, Func<IServiceProvider, TService> implementationFactory, bool replaceExisting = false)
            where TService : class
        {
            if (replaceExisting)
            {
                serviceOptions.RemoveAll<TService>();
            }
            serviceOptions.Services.TryAddTransient<TService>(implementationFactory);
        }

        public static void TryAddTransient<TService, TImplementation>(this IServiceOptions serviceOptions, bool replaceExisting = false)
            where TService : class
            where TImplementation : class, TService
        {
            if (replaceExisting)
            {
                serviceOptions.RemoveAll<TService>();
            }
            serviceOptions.Services.TryAddTransient<TService, TImplementation>();
        }

        public static void TryAddTransient(this IServiceOptions serviceOptions, Type service, Func<IServiceProvider, object> implementationFactory, bool replaceExisting = false)
        {
            if (replaceExisting)
            {
                serviceOptions.RemoveAll(service);
            }
            serviceOptions.Services.TryAddTransient(service, implementationFactory);
        }

        public static void TryAddTransient<TService>(this IServiceOptions serviceOptions, bool replaceExisting = false)
            where TService : class
        {
            if (replaceExisting)
            {
                serviceOptions.RemoveAll<TService>();
            }
            serviceOptions.Services.TryAddTransient<TService>();
        }

        public static void TryAddTransient(this IServiceOptions serviceOptions, Type service, bool replaceExisting = false)
        {
            if (replaceExisting)
            {
                serviceOptions.RemoveAll(service);
            }
            serviceOptions.Services.TryAddTransient(service);
        }

        public static void TryAddTransient(this IServiceOptions serviceOptions, Type service, Type implementationType, bool replaceExisting = false)
        {
            if (replaceExisting)
            {
                serviceOptions.RemoveAll(service);
            }
            serviceOptions.Services.TryAddTransient(service, implementationType);
        }

    }
}