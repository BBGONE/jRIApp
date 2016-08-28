using System;
using System.Collections.Concurrent;
using RIAPP.DataService.DomainService.Interfaces;
using RIAPP.DataService.Utils.Interfaces;

namespace RIAPP.DataService.DomainService
{
    public class ServiceContainer : IServiceContainer
    {
        private readonly ConcurrentDictionary<Type, object> _services;

        public ServiceContainer()
        {
            _services = new ConcurrentDictionary<Type, object>();
        }

        public void AddService(Type serviceType, object instance)
        {
            _services.TryAdd(serviceType, instance);
        }

        public void AddService<T>(T instance)
        {
            _services.TryAdd(typeof(T), instance);
        }

        public void ReplaceService(Type serviceType, object instance)
        {
            var isOk = false;
            while (!isOk)
            {
                var old = LocateService(serviceType);
                if (old != null)
                    isOk = _services.TryUpdate(serviceType, instance, old);
                else
                    isOk = _services.TryAdd(serviceType, instance);
            }
        }

        public void RemoveService(Type serviceType)
        {
            object old;
            _services.TryRemove(serviceType, out old);
        }

        public object LocateService(Type serviceType)
        {
            object result;
            _services.TryGetValue(serviceType, out result);
            return result;
        }

        public T LocateService<T>()
        {
            return (T) LocateService(typeof(T));
        }

        public IAuthorizer Authorizer
        {
            get { return LocateService<IAuthorizer>(); }
        }

        public ISerializer Serializer
        {
            get { return LocateService<ISerializer>(); }
        }

        public IValueConverter ValueConverter
        {
            get { return LocateService<IValueConverter>(); }
        }

        public IDataHelper DataHelper
        {
            get { return LocateService<IDataHelper>(); }
        }

        public IValidationHelper ValidationHelper
        {
            get { return LocateService<IValidationHelper>(); }
        }
    }
}