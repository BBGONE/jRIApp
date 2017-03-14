using Microsoft.Extensions.DependencyInjection;
using RIAPP.DataService.DomainService.Interfaces;
using RIAPP.DataService.Utils.Interfaces;
using System;
using System.Threading;

namespace RIAPP.DataService.DomainService
{
    public class ServiceContainer: IServiceContainer, IDisposable
    {
        private readonly IServiceCollection _serviceCollection;
        private Lazy<IServiceProvider> _provider;

        public ServiceContainer(IServiceCollection serviceCollection)
        {
            _serviceCollection = serviceCollection;
            _provider = new Lazy<IServiceProvider>(()=> this.CreateServiceProvider(), true);
        }

        protected virtual IServiceProvider CreateServiceProvider()
        {
            return this._serviceCollection.BuildServiceProvider();
        }

        public object GetService(Type serviceType)
        {
            return _provider.Value.GetService(serviceType);
        }

        public T GetService<T>()
        {
            return (T) GetService(typeof(T));
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
            Lazy<IServiceProvider> provider = Interlocked.Exchange(ref this._provider, null);
            if (provider== null)
            {
                return;
            }
           
            if (provider.IsValueCreated)
            {
                var disposable = (provider.Value as IDisposable);
                if (disposable != null)
                    disposable.Dispose();
            }
        }
    }
}