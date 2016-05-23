using System;
using System.Collections.Concurrent;
using RIAPP.DataService.DomainService.Interfaces;

namespace RIAPP.DataService.DomainService.Config
{
    public class DataManagerContainer : IDataManagerContainer
    {
        private readonly ConcurrentDictionary<Type, Func<BaseDomainService, object>> _managers;

        public DataManagerContainer()
        {
            _managers = new ConcurrentDictionary<Type, Func<BaseDomainService, object>>();
        }

        public bool isDataManagerRegistered(Type modelType)
        {
            Func<BaseDomainService, object> factory;
            return _managers.TryGetValue(modelType, out factory);
        }


        public object GetDataManager(BaseDomainService dataService, Type modelType)
        {
            Func<BaseDomainService, object> factory;
            if (_managers.TryGetValue(modelType, out factory))
                return factory(dataService);
            return null;
        }

        public IDataManager<TModel> GetDataManager<TModel>(BaseDomainService dataService)
            where TModel : class
        {
            var res = GetDataManager(dataService, typeof(TModel));
            return (IDataManager<TModel>) res;
        }

        public void RegisterDataManager<TDataService, TDataManager, TModel>(
            Func<TDataService, IDataManager<TModel>> dataManagerFactory)
            where TModel : class
            where TDataManager : IDataManager<TModel>
            where TDataService : BaseDomainService
        {
            Func<BaseDomainService, IDataManager<TModel>> func =
                dataService => { return dataManagerFactory((TDataService) dataService); };

            if (_managers.TryAdd(typeof(TModel), func))
            {
                if (RegisteredDM != null)
                {
                    RegisteredDM(this, new RegisteredDMEventArgs(typeof(TDataManager), typeof(TModel)));
                }
            }
        }

        public event EventHandler<RegisteredDMEventArgs> RegisteredDM;
    }
}