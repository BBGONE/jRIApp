using System;

namespace RIAPP.DataService.DomainService.Interfaces
{
    public interface IServiceOptions
    {
        IValidatorContainer ValidatorsContainer { get; }

        IDataManagerContainer DataManagerContainer { get; }

        ServiceOptions RemoveAll<T>();

        ServiceOptions RemoveAll(Type serviceType);

        void TryAddScoped<TService>(Func<IServiceProvider, TService> implementationFactory, bool replaceExisting = false) 
            where TService : class;

        void TryAddScoped<TService, TImplementation>(bool replaceExisting = false)
            where TService : class
            where TImplementation : class, TService;

        void TryAddScoped(Type service, Func<IServiceProvider, object> implementationFactory, bool replaceExisting = false);

        void TryAddScoped<TService>(bool replaceExisting = false) 
            where TService : class;

        void TryAddScoped(Type service, bool replaceExisting = false);

        void TryAddScoped(Type service, Type implementationType, bool replaceExisting = false);

        void TryAddSingleton<TService>(Func<IServiceProvider, TService> implementationFactory, bool replaceExisting = false) 
            where TService : class;

        void TryAddSingleton<TService, TImplementation>(bool replaceExisting = false)
            where TService : class
            where TImplementation : class, TService;

        void TryAddSingleton(Type service, Func<IServiceProvider, object> implementationFactory, bool replaceExisting = false);

        void TryAddSingleton<TService>(bool replaceExisting = false) 
            where TService : class;

        void TryAddSingleton(Type service, bool replaceExisting = false);

        void TryAddSingleton(Type service, Type implementationType, bool replaceExisting = false);

        void TryAddTransient<TService>(Func<IServiceProvider, TService> implementationFactory, bool replaceExisting = false) 
            where TService : class;

        void TryAddTransient<TService, TImplementation>(bool replaceExisting = false)
            where TService : class
            where TImplementation : class, TService;

        void TryAddTransient(Type service, Func<IServiceProvider, object> implementationFactory, bool replaceExisting = false);

        void TryAddTransient<TService>(bool replaceExisting = false) 
            where TService : class;

        void TryAddTransient(Type service, bool replaceExisting = false);

        void TryAddTransient(Type service, Type implementationType, bool replaceExisting = false);
    }
}