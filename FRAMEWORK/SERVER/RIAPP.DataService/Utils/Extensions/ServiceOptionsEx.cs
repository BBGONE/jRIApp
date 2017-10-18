using RIAPP.DataService.DomainService.Interfaces;
using System;
using Microsoft.Extensions.DependencyInjection;

namespace RIAPP.DataService.Utils.Extensions
{
    public static class ServiceOptionsEx
    {
        public static void AddSingleton<TService>(this IServiceOptions options, TService instance)
         where TService : class
        {
            options.Services.AddSingleton<TService>(instance);
        }

        public static void AddSingleton<TService, TImplementation>(this IServiceOptions options)
         where TService : class
         where TImplementation : class, TService
        {
            options.Services.AddSingleton<TService, TImplementation>();
        }

        public static void AddSingleton(
           this IServiceOptions options,
           Type serviceType)
        {
            options.Services.AddSingleton(serviceType, serviceType);
        }

        public static void AddSingleton<TService>(
           this IServiceOptions options,
           Func<IServiceProvider, TService> implementationFactory)
           where TService : class
        {
            options.Services.AddSingleton<TService>(implementationFactory);
        }

        public static void AddSingleton(
           this IServiceOptions options,
           Type serviceType,
           Func<IServiceProvider, object> implementationFactory)
        {
            options.Services.AddSingleton(serviceType, implementationFactory);
        }

        public static void AddScoped<TService, TImplementation>(this IServiceOptions options)
          where TService : class
          where TImplementation : class, TService
        {
            options.Services.AddScoped<TService, TImplementation>();
        }

        public static void AddScoped(
           this IServiceOptions options,
           Type serviceType)
        {
            options.Services.AddScoped(serviceType, serviceType);
        }

        public static void AddScoped<TService>(
           this IServiceOptions options,
           Func<IServiceProvider, TService> implementationFactory)
           where TService : class
        {
            options.Services.AddScoped<TService>(implementationFactory);
        }

        public static void AddScoped(
           this IServiceOptions options,
           Type serviceType,
           Func<IServiceProvider, object> implementationFactory)
        {
            options.Services.AddScoped(serviceType, implementationFactory);
        }

        public static void AddTransient<TService, TImplementation>(this IServiceOptions options)
        where TService : class
        where TImplementation : class, TService
        {
            options.Services.AddTransient<TService, TImplementation>();
        }

        public static void AddTransient(
           this IServiceOptions options,
           Type serviceType)
        {
            options.Services.AddTransient(serviceType, serviceType);
        }

        public static void AddTransient<TService>(
           this IServiceOptions options,
           Func<IServiceProvider, TService> implementationFactory)
           where TService : class
        {
            options.Services.AddTransient<TService>(implementationFactory);
        }

        public static void AddTransient(
           this IServiceOptions options,
           Type serviceType,
           Func<IServiceProvider, object> implementationFactory)
        {
            options.Services.AddTransient(serviceType, implementationFactory);
        }
    }
}