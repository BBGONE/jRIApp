using RIAPP.DataService.Core.CodeGen;
using RIAPP.DataService.Core.Security;
using RIAPP.DataService.Utils;
using System;
using System.Collections.Generic;

namespace RIAPP.DataService.Core
{
    public interface IServiceContainer
    {
        IServiceProvider ServiceProvider { get; }
        ISerializer Serializer { get; }
        IServiceContainer CreateScope();

        IDataHelper DataHelper { get; }

        IValueConverter ValueConverter { get; }

        IAuthorizer Authorizer { get; }

        ICodeGenFactory CodeGenFactory { get; }

        IDataManagerContainer DataManagerContainer { get; }

        IValidatorContainer ValidatorContainer { get; }

        ICRUDOperationsUseCaseFactory CRUDOperationsUseCaseFactory { get; }

        IQueryOperationsUseCaseFactory QueryOperationsUseCaseFactory { get; }

        IRefreshOperationsUseCaseFactory RefreshOperationsUseCaseFactory { get; }

        IInvokeOperationsUseCaseFactory InvokeOperationsUseCaseFactory { get; }

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