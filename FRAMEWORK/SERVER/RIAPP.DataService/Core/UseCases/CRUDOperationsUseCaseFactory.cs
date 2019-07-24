using RIAPP.DataService.Core.Types;
using System;
using System.Threading.Tasks;

namespace RIAPP.DataService.Core
{
    public class CRUDOperationsUseCaseFactory<TService> : ICRUDOperationsUseCaseFactory<TService>
        where TService:BaseDomainService
    {
        private readonly Func<BaseDomainService, Action<Exception>, Action<RowInfo>, Func<IServiceOperationsHelper, Task>, ICRUDOperationsUseCase<TService>> _func;

        public CRUDOperationsUseCaseFactory(Func<BaseDomainService, Action<Exception>, Action<RowInfo>, Func<IServiceOperationsHelper, Task>, ICRUDOperationsUseCase<TService>> func)
        {
            this._func = func;
        }

        public ICRUDOperationsUseCase Create(BaseDomainService service, Action<Exception> onError, Action<RowInfo> trackChanges, Func<IServiceOperationsHelper, Task> executeChangeSet)
        {
            return this._func(service, onError, trackChanges, executeChangeSet);
        }

        public ICRUDOperationsUseCase<TService> Create(TService service, Action<Exception> onError, Action<RowInfo> trackChanges, Func<IServiceOperationsHelper, Task> executeChangeSet)
        {
            return this._func(service, onError, trackChanges, executeChangeSet);
        }
    }
}
