using RIAPP.DataService.Core.Config;
using System;
using System.Collections.Generic;

namespace RIAPP.DataService.Core
{
    public interface IDataManagerContainer
    {
        object GetDataManager(Type modelType);

        IDataManager<TModel> GetDataManager<TModel>()
            where TModel : class;

        IEnumerable<ServiceTypeDescriptor> Descriptors { get; }
    }

    public interface IDataManagerContainer<TService> : IDataManagerContainer
        where TService: BaseDomainService
    {
   
    }
}