﻿using RIAPP.DataService.Core.Types;
using System;
using System.Threading.Tasks;

namespace RIAPP.DataService.Core
{
    public delegate Task ChangeSetExecutor();
    public delegate Task AfterChangeSetExecuted(IServiceOperationsHelper serviceOperationHelper);
    public delegate Task SubResultsExecutor(IServiceOperationsHelper serviceOperationHelper, SubResultList subResults);

    public interface ICRUDOperationsUseCaseFactory
    {
        ICRUDOperationsUseCase Create(BaseDomainService service, Action<Exception> onError, 
            Action<RowInfo> trackChanges, 
            ChangeSetExecutor executeChangeSet, 
            AfterChangeSetExecuted afterChangeSetExecuted,
            SubResultsExecutor subResultsExecutor);
    }

    public interface ICRUDOperationsUseCaseFactory<TService>: ICRUDOperationsUseCaseFactory
        where TService: BaseDomainService
    {
        ICRUDOperationsUseCase<TService> Create(TService service, Action<Exception> onError, 
            Action<RowInfo> trackChanges, 
            ChangeSetExecutor executeChangeSet, 
            AfterChangeSetExecuted afterChangeSetExecuted,
            SubResultsExecutor subResultsExecutor);
    }

}
