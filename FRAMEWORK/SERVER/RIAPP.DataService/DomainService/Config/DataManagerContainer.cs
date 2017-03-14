using System;
using System.Collections.Concurrent;
using RIAPP.DataService.DomainService.Interfaces;
using System.Collections.Generic;

namespace RIAPP.DataService.DomainService.Config
{
    public class DataManagerContainer : IDataManagerContainer
    {
        private readonly ConcurrentDictionary<Type, ServiceTypeDescriptor> _managers;

        public DataManagerContainer()
        {
            _managers = new ConcurrentDictionary<Type, ServiceTypeDescriptor>();
        }

        public bool isDataManagerRegistered(Type modelType)
        {
            ServiceTypeDescriptor descriptor;
            return _managers.TryGetValue(modelType, out descriptor);
        }

        public object GetDataManager(IServiceContainer services, Type modelType)
        {
            ServiceTypeDescriptor descriptor;
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

        public void RegisterDataManager(Type ModelType, Type DataManagerType)
        {
            Type unboundType = typeof(IDataManager<>);
            Type[] argsType = { ModelType };
            Type serviceType = unboundType.MakeGenericType(argsType);

            ServiceTypeDescriptor descriptor = new ServiceTypeDescriptor
            {
                ImplementationType = DataManagerType,
                ServiceType = serviceType,
                ModelType = ModelType
            };
            _managers.TryAdd(ModelType, descriptor);
        }

        public void RegisterDataManager<TModel, TDataManager>()
            where TModel : class
            where TDataManager : IDataManager<TModel>
        {
            ServiceTypeDescriptor descriptor = new ServiceTypeDescriptor {
                ImplementationType = typeof(TDataManager),
                ServiceType = typeof(IDataManager<TModel>),
                ModelType = typeof(TModel) };
            _managers.TryAdd(typeof(TModel), descriptor);
        }

        public IEnumerable<ServiceTypeDescriptor> Descriptors { get { return _managers.Values; } }
    }
}