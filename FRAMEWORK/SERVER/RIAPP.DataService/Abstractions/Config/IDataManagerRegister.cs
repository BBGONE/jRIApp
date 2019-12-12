using System;
using System.Collections.Generic;

namespace RIAPP.DataService.Core.Config
{
    public interface IDataManagerRegister
    {
        bool isDataManagerRegistered(Type modelType);

        bool TryGetDescriptor(Type modelType, out ServiceTypeDescriptor descriptor);

        void RegisterDataManager(Type ModelType, Type DataManagerType);

        void RegisterDataManager<TModel, TDataManager>()
            where TModel : class
            where TDataManager : IDataManager<TModel>;

        IEnumerable<ServiceTypeDescriptor> Descriptors { get; }
    }
}