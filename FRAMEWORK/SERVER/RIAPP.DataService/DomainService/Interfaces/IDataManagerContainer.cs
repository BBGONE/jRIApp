using System;
using System.Collections.Generic;
using RIAPP.DataService.DomainService.Config;

namespace RIAPP.DataService.DomainService.Interfaces
{
    public interface IDataManagerContainer
    {
        bool isDataManagerRegistered(Type modelType);
        object GetDataManager(IServiceContainer services, Type modelType);

        IDataManager<TModel> GetDataManager<TModel>(IServiceContainer services)
            where TModel : class;

        void RegisterDataManager(Type ModelType, Type DataManagerType);

        void RegisterDataManager<TModel,TDataManager>()
            where TModel : class
            where TDataManager : IDataManager<TModel>;

        IEnumerable<ServiceTypeDescriptor> Descriptors { get; }
    }
}