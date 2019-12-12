using Microsoft.Extensions.DependencyInjection;
using RIAPP.DataService.Core.CodeGen;
using RIAPP.DataService.Core.Security;
using RIAPP.DataService.Utils;
using System;
using System.Collections.Generic;
using System.Threading;

namespace RIAPP.DataService.Core
{
    public class ServiceContainer<TService>: IServiceContainer<TService>, IDisposable
        where TService : BaseDomainService
    {
        private IDisposable _scope;
        private readonly IServiceProvider _provider;
        private readonly ISerializer _serializer;

        public ServiceContainer(IServiceProvider serviceProvider, ISerializer serializer)
        {
            _provider = serviceProvider ?? throw new ArgumentNullException(nameof(serviceProvider));
           _serializer =  serializer ?? throw new ArgumentNullException(nameof(serializer));
            _scope = null;
        }

        private ServiceContainer(ServiceContainer<TService> serviceContainer, ISerializer serializer)
        {
            IServiceScopeFactory scopeFactory = serviceContainer.GetRequiredService<IServiceScopeFactory>();
            IServiceScope scope = scopeFactory.CreateScope();
            _provider = scope.ServiceProvider;
            _scope = scope;
            _serializer = serializer;
        }

        public IServiceContainer CreateScope()
        {
            return new ServiceContainer<TService>(this, _serializer);
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

        public IServiceProvider ServiceProvider
        {
            get
            {
                return _provider;
            }
        }

        public ISerializer Serializer
        {
            get
            {
                return _serializer;
            }
        }


        IServiceOperationsHelper IServiceContainer.ServiceHelper
        {
            get
            {
                return this.GetServiceHelper();
            }
        }

        IDataHelper IServiceContainer.DataHelper
        {
            get
            {
                return this.GetDataHelper();
            }
        }

        IValueConverter IServiceContainer.ValueConverter
        {
            get
            {
                return this.GetValueConverter();
            }
        }

        IAuthorizer IServiceContainer.Authorizer
        {
            get
            {
                return this.GetAuthorizer();
            }
        }

        ICodeGenFactory IServiceContainer.CodeGenFactory
        {
            get
            {
                return this.GetCodeGenFactory();
            }
        }

        IDataManagerContainer IServiceContainer.DataManagerContainer
        {
            get
            {
                return this.GetDataManagerContainer();
            }
        }

        IValidatorContainer IServiceContainer.ValidatorContainer
        {
            get
            {
                return this.GetValidatorContainer();
            }
        }

        ICRUDOperationsUseCaseFactory IServiceContainer.CRUDOperationsUseCaseFactory
        {
            get
            {
                return this.GetCRUDOperationsUseCaseFactory();
            }
        }

        IQueryOperationsUseCaseFactory IServiceContainer.QueryOperationsUseCaseFactory
        {
            get
            {
                return this.GetQueryOperationsUseCaseFactory();
            }
        }

        IRefreshOperationsUseCaseFactory IServiceContainer.RefreshOperationsUseCaseFactory
        {
            get
            {
                return this.GetRefreshOperationsUseCaseFactory();
            }
        }

        IInvokeOperationsUseCaseFactory IServiceContainer.InvokeOperationsUseCaseFactory
        {
            get
            {
                return this.GetInvokeOperationsUseCaseFactory();
            }
        }

        public void Dispose()
        {
            IDisposable scope = Interlocked.Exchange(ref this._scope, null);
            scope?.Dispose();
        }
    }
}