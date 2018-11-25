using RIAPP.DataService.DomainService.Config;
using RIAPP.DataService.Utils.Interfaces;
using System;
using System.Collections.Generic;
using System.Security.Principal;

namespace RIAPP.DataService.DomainService.Interfaces
{
    public interface IServiceContainer
    {
        ISerializer Serializer { get; }
        IPrincipal User { get; }
        ServiceConfig Config { get; }

        IAuthorizer Authorizer { get; }
        IDataHelper DataHelper { get; }
        IValidationHelper ValidationHelper { get; }
        IValueConverter ValueConverter { get; }
        IServiceOperationsHelper ServiceHelper { get; }
        IServiceContainer CreateScope();

        object GetService(Type serviceType);

        T GetService<T>();

        T GetRequiredService<T>();

        IEnumerable<object> GetServices(Type serviceType);

        IEnumerable<T> GetServices<T>();
    }

    public interface IServiceContainer<TService> : IServiceContainer
        where TService : BaseDomainService
    {

    }
}