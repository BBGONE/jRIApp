using Net451.Microsoft.Extensions.DependencyInjection;
using RIAPP.DataService.DomainService.CodeGen;
using RIAPP.DataService.DomainService.Security;
using RIAPP.DataService.Utils;
using System;
using System.Collections.Generic;
using System.Threading;

namespace RIAPP.DataService.DomainService
{
    public class ServiceContainer<TService>: IServiceContainer<TService>, IDisposable
        where TService : BaseDomainService
    {
        private IDisposable _scope;
        private readonly IServiceProvider _provider;
        private readonly Lazy<ISerializer> _serializer;

        public ServiceContainer(IServiceProvider serviceProvider)
        {
            _provider = serviceProvider;
            _scope = null;
            _serializer =  new Lazy<ISerializer>(()=> serviceProvider.GetRequiredService<ISerializer>(), true);
        }

        private ServiceContainer(ServiceContainer<TService> serviceContainer)
        {
            IServiceScopeFactory scopeFactory = serviceContainer.GetRequiredService<IServiceScopeFactory>();
            IServiceScope scope = scopeFactory.CreateScope();
            _provider = scope.ServiceProvider;
            _scope = scope;
            _serializer = new Lazy<ISerializer>(() => _provider.GetRequiredService<ISerializer>(), true);
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
            get
            {
                return _serializer.Value;
            }
        }

        public IUserProvider UserProvider
        {
            get
            {
                return GetRequiredService<IUserProvider>();
            }
        }

        IAuthorizer IServiceContainer.GetAuthorizer()
        {
            return this.GetAuthorizer();
        }

        IValueConverter IServiceContainer.GetValueConverter()
        {
            return this.GetValueConverter();
        }

        IDataHelper IServiceContainer.GetDataHelper()
        {
            return this.GetDataHelper();
        }

        IValidationHelper IServiceContainer.GetValidationHelper()
        {
            return this.GetValidationHelper();
        }

        IServiceOperationsHelper IServiceContainer.GetServiceHelper()
        {
            return this.GetServiceHelper();
        }

        ICodeGenFactory IServiceContainer.GetCodeGenFactory()
        {
            return this.GetCodeGenFactory();
        }

        IDataManagerContainer IServiceContainer.GetDataManagerContainer()
        {
            return this.GetDataManagerContainer();
        }

        IValidatorContainer IServiceContainer.GetValidatorContainer()
        {
            return this.GetValidatorContainer();
        }

        public IAuthorizer<TService> GetAuthorizer()
        {
            return GetRequiredService<IAuthorizer<TService>>(); 
        }

        public IValueConverter<TService> GetValueConverter()
        {
            return GetRequiredService<IValueConverter<TService>>();
        }

        public IDataHelper<TService> GetDataHelper()
        {
            return GetRequiredService<IDataHelper<TService>>();
        }

        public IValidationHelper<TService> GetValidationHelper()
        {
            return GetRequiredService<IValidationHelper<TService>>();
        }

        public IServiceOperationsHelper<TService> GetServiceHelper()
        {
            return GetRequiredService<IServiceOperationsHelper<TService>>();
        }

        public ICodeGenFactory<TService> GetCodeGenFactory()
        {
            return GetRequiredService<ICodeGenFactory<TService>>();
        }

        public IDataManagerContainer<TService> GetDataManagerContainer()
        {
            return GetRequiredService<IDataManagerContainer<TService>>();
        }

        public IValidatorContainer<TService> GetValidatorContainer()
        {
            return GetRequiredService<IValidatorContainer<TService>>();
        }

        public void Dispose()
        {
            IDisposable scope = Interlocked.Exchange(ref this._scope, null);
            scope?.Dispose();
        }
    }
}