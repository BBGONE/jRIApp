﻿using RIAPP.DataService.DomainService.CodeGen;
using RIAPP.DataService.DomainService.Security;
using RIAPP.DataService.Utils;
using System;
using System.Collections.Generic;

namespace RIAPP.DataService.DomainService
{
    public interface IServiceContainer
    {
        ISerializer Serializer { get; }
        IUserProvider UserProvider { get; }
        IServiceContainer CreateScope();

        IAuthorizer GetAuthorizer();
        IDataHelper GetDataHelper();
        IValidationHelper GetValidationHelper();
        IValueConverter GetValueConverter();
        IServiceOperationsHelper GetServiceHelper();
        ICodeGenFactory GetCodeGenFactory();
        IDataManagerContainer GetDataManagerContainer();
        IValidatorContainer GetValidatorContainer();

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