using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using RIAPP.DataService.DomainService.Config;
using RIAPP.DataService.DomainService.Interfaces;
using System;

namespace RIAPP.DataService.DomainService
{
    public class ServiceOptions : IServiceOptions
    {
        private readonly IServiceCollection _services;
        private readonly ServiceConfig _serviceConfig;

        public ServiceOptions(IServiceCollection services, ServiceConfig serviceConfig)
        {
            this._services = services;
            this._serviceConfig = serviceConfig;
        }

        public IValidatorContainer ValidatorsContainer
        {
            get { return _serviceConfig.ValidatorsContainer; }
        }

        public IDataManagerContainer DataManagerContainer
        {
            get { return _serviceConfig.DataManagerContainer; }
        }

        public ServiceOptions RemoveAll<T>()
        {
            this._services.RemoveAll<T>();
            return this;
        }
       
        public ServiceOptions RemoveAll(Type serviceType)
        {
            this._services.RemoveAll(serviceType);
            return this;
        }

        public void TryAddScoped<TService>(Func<IServiceProvider, TService> implementationFactory, bool replaceExisting = false) 
            where TService : class
        {
            if (replaceExisting)
            {
                this.RemoveAll<TService>();
            }
            this._services.TryAddScoped<TService>(implementationFactory);
        }

        public void TryAddScoped<TService, TImplementation>(bool replaceExisting = false)
            where TService : class
            where TImplementation : class, TService
        {
            if (replaceExisting)
            {
                this.RemoveAll<TService>();
            }
            this._services.TryAddScoped<TService, TImplementation>();
        }

        public void TryAddScoped(Type service, Func<IServiceProvider, object> implementationFactory, bool replaceExisting = false)
        {
            if (replaceExisting)
            {
                this.RemoveAll(service);
            }
            this._services.TryAddScoped(service, implementationFactory);
        }

        public void TryAddScoped<TService>(bool replaceExisting = false) 
            where TService : class
        {
            if (replaceExisting)
            {
                this.RemoveAll<TService>();
            }
            this._services.TryAddScoped<TService>();
        }

        public void TryAddScoped(Type service, bool replaceExisting = false)
        {
            if (replaceExisting)
            {
                this.RemoveAll(service);
            }
            this._services.TryAddScoped(service);
        }

        public void TryAddScoped(Type service, Type implementationType, bool replaceExisting = false)
        {
            if (replaceExisting)
            {
                this.RemoveAll(service);
            }
            this._services.TryAddScoped(service, implementationType);
        }

        public void TryAddSingleton<TService>(Func<IServiceProvider, TService> implementationFactory, bool replaceExisting = false) 
            where TService : class
        {
            if (replaceExisting)
            {
                this.RemoveAll<TService>();
            }
            this._services.TryAddSingleton<TService>(implementationFactory);
        }

        public void TryAddSingleton<TService, TImplementation>(bool replaceExisting = false)
            where TService : class
            where TImplementation : class, TService
        {
            if (replaceExisting)
            {
                this.RemoveAll<TService>();
            }
            this._services.TryAddSingleton<TService, TImplementation>();
        }

        public void TryAddSingleton(Type service, Func<IServiceProvider, object> implementationFactory, bool replaceExisting = false)
        {
            if (replaceExisting)
            {
                this.RemoveAll(service);
            }
            this._services.TryAddSingleton(service, implementationFactory);
        }

        public void TryAddSingleton<TService>(bool replaceExisting = false) 
            where TService : class
        {
            if (replaceExisting)
            {
                this.RemoveAll<TService>();
            }
            this._services.TryAddSingleton<TService>();
        }

        public void TryAddSingleton(Type service, bool replaceExisting = false)
        {
            if (replaceExisting)
            {
                this.RemoveAll(service);
            }
            this._services.TryAddSingleton(service);
        }

        public void TryAddSingleton(Type service, Type implementationType, bool replaceExisting = false)
        {
            if (replaceExisting)
            {
                this.RemoveAll(service);
            }
            this._services.TryAddSingleton(service, implementationType);
        }


        public void TryAddTransient<TService>(Func<IServiceProvider, TService> implementationFactory, bool replaceExisting = false) 
            where TService : class
        {
            if (replaceExisting)
            {
                this.RemoveAll<TService>();
            }
            this._services.TryAddTransient<TService>(implementationFactory);
        }

        public void TryAddTransient<TService, TImplementation>(bool replaceExisting = false)
            where TService : class
            where TImplementation : class, TService
        {
            if (replaceExisting)
            {
                this.RemoveAll<TService>();
            }
            this._services.TryAddTransient<TService, TImplementation>();
        }

        public void TryAddTransient(Type service, Func<IServiceProvider, object> implementationFactory, bool replaceExisting = false)
        {
            if (replaceExisting)
            {
                this.RemoveAll(service);
            }
            this._services.TryAddTransient(service, implementationFactory);
        }

        public void TryAddTransient<TService>(bool replaceExisting = false) 
            where TService : class
        {
            if (replaceExisting)
            {
                this.RemoveAll<TService>();
            }
            this._services.TryAddTransient<TService>();
        }

        public void TryAddTransient(Type service, bool replaceExisting = false)
        {
            if (replaceExisting)
            {
                this.RemoveAll(service);
            }
            this._services.TryAddTransient(service);
        }

        public void TryAddTransient(Type service, Type implementationType, bool replaceExisting = false)
        {
            if (replaceExisting)
            {
                this.RemoveAll(service);
            }
            this._services.TryAddTransient(service, implementationType);
        }
    }
}