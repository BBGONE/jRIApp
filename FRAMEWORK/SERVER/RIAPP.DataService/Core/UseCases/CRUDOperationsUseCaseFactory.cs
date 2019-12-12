using RIAPP.DataService.Core.Types;
using System;

namespace RIAPP.DataService.Core
{
    public class CRUDOperationsUseCaseFactory<TService> : ICRUDOperationsUseCaseFactory<TService>
        where TService:BaseDomainService
    {
        private readonly Func<BaseDomainService, Action<Exception>, Action<RowInfo>, ChangeSetExecutor, AfterChangeSetExecuted, AfterChangeSetCommited, ICRUDOperationsUseCase<TService>> _func;

        public CRUDOperationsUseCaseFactory(Func<BaseDomainService, Action<Exception>, Action<RowInfo>, ChangeSetExecutor, AfterChangeSetExecuted, AfterChangeSetCommited, ICRUDOperationsUseCase<TService>> func)
        {
            this._func = func;
        }

        public ICRUDOperationsUseCase Create(BaseDomainService service, 
            Action<Exception> onError, 
            Action<RowInfo> trackChanges, 
            ChangeSetExecutor executeChangeSet, 
            AfterChangeSetExecuted afterChangeSetExecuted, 
            AfterChangeSetCommited subResultsExecutor)
        {
            return this._func(service, onError, trackChanges, executeChangeSet, afterChangeSetExecuted, subResultsExecutor);
        }

        public ICRUDOperationsUseCase<TService> Create(TService service, 
            Action<Exception> onError, 
            Action<RowInfo> trackChanges, 
            ChangeSetExecutor executeChangeSet, 
            AfterChangeSetExecuted afterChangeSetExecuted, 
            AfterChangeSetCommited subResultsExecutor)
        {
            return this._func(service, onError, trackChanges, executeChangeSet, afterChangeSetExecuted, subResultsExecutor);
        }
    }
}
