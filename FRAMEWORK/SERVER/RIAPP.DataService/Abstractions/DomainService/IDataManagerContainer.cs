using RIAPP.DataService.DomainService.Config;
using System;
using System.Collections.Generic;

namespace RIAPP.DataService.DomainService
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