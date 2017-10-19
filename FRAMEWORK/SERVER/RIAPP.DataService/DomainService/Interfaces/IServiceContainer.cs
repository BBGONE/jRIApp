using RIAPP.DataService.Utils.Interfaces;
using System;
using System.Collections.Generic;

namespace RIAPP.DataService.DomainService.Interfaces
{
    public interface IServiceContainer
    {
        IAuthorizer Authorizer { get; }
        IDataHelper DataHelper { get; }
        ISerializer Serializer { get; }
        IValidationHelper ValidationHelper { get; }
        IValueConverter ValueConverter { get; }
        IServiceOperationsHelper ServiceHelper { get; }

        IServiceContainer CreateScope();

        object GetService(Type serviceType);

        T GetService<T>();

        IEnumerable<object> GetServices(Type serviceType);

        IEnumerable<T> GetServices<T>();
    }
}