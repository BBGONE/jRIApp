using Microsoft.Extensions.DependencyInjection;
using RIAPP.DataService.DomainService.Config;
using RIAPP.DataService.DomainService.Interfaces;
using RIAPP.DataService.Utils.Interfaces;
using System;
using System.Collections.Generic;
using System.Security.Principal;
using System.Threading;

namespace RIAPP.DataService.DomainService
{
    public class ServiceContainer<TService>: IServiceContainer<TService>, IDisposable
        where TService : BaseDomainService
    {
        private IDisposable _scope;
        private readonly ServiceConfig _serviceConfig;
        private readonly IServiceProvider _provider;
        private readonly Lazy<ISerializer> _serializer;
        private readonly Lazy<IPrincipal> _user;

        public ServiceContainer(IServiceProvider serviceProvider, ServiceConfig serviceConfig)
        {
            _provider = serviceProvider;
            _scope = null;
            _serviceConfig = serviceConfig;
            _serializer =  new Lazy<ISerializer>(()=> serviceProvider.GetRequiredService<ISerializer>(), true);
            _user = new Lazy<IPrincipal>(() => serviceProvider.GetRequiredService<IPrincipal>(), true);
        }
        
        private ServiceContainer(ServiceContainer<TService> serviceContainer)
        {
            IServiceScopeFactory scopeFactory = serviceContainer.GetRequiredService<IServiceScopeFactory>();
            IServiceScope scope = scopeFactory.CreateScope();
            _provider = scope.ServiceProvider;
            _scope = scope;
            _serviceConfig = serviceContainer._serviceConfig;
            _serializer = new Lazy<ISerializer>(() => _provider.GetRequiredService<ISerializer>(), true);
            _user = new Lazy<IPrincipal>(() => _provider.GetRequiredService<IPrincipal>(), true);
        }

        public IServiceContainer CreateScope()
        {
            return new ServiceContainer<TService>(this);
        }

        public object GetService(Type serviceType)
        {
            return _provider.GetService(serviceType);
        }

        public T GetService<T>()
        {
            return _provider.GetService<T>();
        }

        public T GetRequiredService<T>()
        {
            return _provider.GetRequiredService<T>();
        }

        public IEnumerable<object> GetServices(Type serviceType)
        {
            return _provider.GetServices(serviceType);
        }

        public IEnumerable<T> GetServices<T>()
        {
            return _provider.GetServices<T>();
        }

        public ISerializer Serializer
        {
            get { return _serializer.Value; }
        }

        public IPrincipal User
        {
            get { return _user.Value; }
        }

        public IAuthorizer Authorizer
        {
            get { return GetRequiredService<IAuthorizer<TService>>(); }
        }

        public IValueConverter ValueConverter
        {
            get { return GetRequiredService<IValueConverter<TService>>(); }
        }

        public IDataHelper DataHelper
        {
            get { return GetRequiredService<IDataHelper<TService>>(); }
        }

        public IValidationHelper ValidationHelper
        {
            get { return GetRequiredService<IValidationHelper<TService>>(); }
        }

        public IServiceOperationsHelper ServiceHelper
        {
            get { return GetRequiredService<IServiceOperationsHelper<TService>>(); }
        }

        public ServiceConfig Config
        {
            get { return _serviceConfig; }
        }

        public void Dispose()
        {
            IDisposable scope = Interlocked.Exchange(ref this._scope, null);
            scope?.Dispose();
        }
    }
}