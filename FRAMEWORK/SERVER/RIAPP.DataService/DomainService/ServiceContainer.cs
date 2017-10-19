using Microsoft.Extensions.DependencyInjection;
using RIAPP.DataService.DomainService.Interfaces;
using RIAPP.DataService.Utils.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading;

namespace RIAPP.DataService.DomainService
{
    public class ServiceContainer: IServiceContainer, IDisposable
    {
        private Lazy<IServiceProvider> _provider;
        private IDisposable _scope;

        public ServiceContainer(IServiceCollection services)
        {
            services.AddSingleton<IServiceContainer>(this);
            this._scope = null;
            this._provider = new Lazy<IServiceProvider>(()=>
            {
                var provider = services.BuildServiceProvider();
                this._scope = provider as IDisposable;
                return provider;
            }, true);
        }
        
        private ServiceContainer(IServiceProvider serviceProvider, IDisposable scope)
        {
            _provider = new Lazy<IServiceProvider>(()=> serviceProvider);
            _scope = scope;
        }


        public IServiceContainer CreateScope()
        {
            IServiceScopeFactory scopeFactory = this.GetService<IServiceScopeFactory>();
            IServiceScope scope = scopeFactory.CreateScope();
            return new ServiceContainer(scope.ServiceProvider, scope);
        }

        public object GetService(Type serviceType)
        {
            return _provider.Value.GetService(serviceType);
        }

        public T GetService<T>()
        {
            return _provider.Value.GetService<T>();
        }

        public IEnumerable<object> GetServices(Type serviceType)
        {
            return _provider.Value.GetServices(serviceType);
        }

        public IEnumerable<T> GetServices<T>()
        {
            return _provider.Value.GetServices<T>();
        }

        public IAuthorizer Authorizer
        {
            get { return GetService<IAuthorizer>(); }
        }

        public ISerializer Serializer
        {
            get { return GetService<ISerializer>(); }
        }

        public IValueConverter ValueConverter
        {
            get { return GetService<IValueConverter>(); }
        }

        public IDataHelper DataHelper
        {
            get { return GetService<IDataHelper>(); }
        }

        public IValidationHelper ValidationHelper
        {
            get { return GetService<IValidationHelper>(); }
        }

        public IServiceOperationsHelper ServiceHelper
        {
            get { return GetService<IServiceOperationsHelper>(); }
        }

        public void Dispose()
        {
            IDisposable scope = Interlocked.Exchange(ref this._scope, null);
            if (scope == null)
            {
                return;
            }

            scope.Dispose();
        }
    }
}