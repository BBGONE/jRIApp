using System;
using RIAPP.DataService.Utils.Interfaces;

namespace RIAPP.DataService.DomainService.Interfaces
{
    public interface IServiceContainer
    {
        IAuthorizer Authorizer { get; }
        IDataHelper DataHelper { get; }
        ISerializer Serializer { get; }
        IValidationHelper ValidationHelper { get; }
        IValueConverter ValueConverter { get; }
        void AddService(Type serviceType, object instance);

        void AddOrUpdateService(Type serviceType, object instance);

        void RemoveService(Type serviceType);

        object LocateService(Type serviceType);

        T LocateService<T>();
    }
}