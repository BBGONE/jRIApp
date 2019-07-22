using RIAPP.DataService.Core.Types;
using System;
using System.Threading.Tasks;

namespace RIAPP.DataService.Core
{
    public class CRUDOperationsUseCaseFactory : ICRUDOperationsUseCaseFactory
    {
        private readonly Func<BaseDomainService, Action<Exception>, Action<RowInfo>, Func<Task>, ICRUDOperationsUseCase> _func;

        public CRUDOperationsUseCaseFactory(Func<BaseDomainService, Action<Exception>, Action<RowInfo>, Func<Task>, ICRUDOperationsUseCase> func)
        {
            this._func = func;
        }

        public ICRUDOperationsUseCase Create(BaseDomainService service, Action<Exception> onError, Action<RowInfo> trackChanges, Func<Task> executeChangeSet)
        {
            return this._func(service, onError, trackChanges, executeChangeSet);
        }
    }
}
