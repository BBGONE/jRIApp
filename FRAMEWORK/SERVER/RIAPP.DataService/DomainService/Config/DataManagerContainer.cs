using System;
using System.Collections.Concurrent;
using RIAPP.DataService.DomainService.Interfaces;
using System.Collections.Generic;

namespace RIAPP.DataService.DomainService.Config
{
    public class DataManagerContainer : IDataManagerContainer
    {
        private readonly ConcurrentDictionary<Type, SvcDescriptor> _managers;

        public DataManagerContainer()
        {
            _managers = new ConcurrentDictionary<Type, SvcDescriptor>();
        }

        public bool isDataManagerRegistered(Type modelType)
        {
            SvcDescriptor descriptor;
            return _managers.TryGetValue(modelType, out descriptor);
        }

        public object GetDataManager(IServiceContainer services, Type modelType)
        {
            SvcDescriptor descriptor;
            if (_managers.TryGetValue(modelType, out descriptor))
                return services.GetService(descriptor.ServiceType);
            return null;
        }

        public IDataManager<TModel> GetDataManager<TModel>(IServiceContainer services)
            where TModel : class
        {
            var res = GetDataManager(services, typeof(TModel));
            return (IDataManager<TModel>) res;
        }

        public void RegisterDataManager<TModel, TDataManager>()
            where TModel : class
            where TDataManager : IDataManager<TModel>
        {
            SvcDescriptor descriptor = new SvcDescriptor {
                ImplementationType = typeof(TDataManager),
                ServiceType = typeof(IDataManager<TModel>),
                ModelType = typeof(TModel) };
            _managers.TryAdd(typeof(TModel), descriptor);
        }

        public IEnumerable<SvcDescriptor> Descriptors { get { return _managers.Values; } }
    }
}