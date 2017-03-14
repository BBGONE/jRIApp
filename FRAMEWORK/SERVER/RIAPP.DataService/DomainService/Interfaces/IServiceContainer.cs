using RIAPP.DataService.Utils.Interfaces;
using System;

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

        object GetService(Type serviceType);

        T GetService<T>();
    }
}