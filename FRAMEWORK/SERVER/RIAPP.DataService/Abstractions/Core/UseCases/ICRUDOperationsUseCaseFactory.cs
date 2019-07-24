using RIAPP.DataService.Core.Types;
using System;
using System.Threading.Tasks;

namespace RIAPP.DataService.Core
{
    public interface ICRUDOperationsUseCaseFactory
    {
        ICRUDOperationsUseCase Create(BaseDomainService service, Action<Exception> onError, Action<RowInfo> trackChanges, Func<IServiceOperationsHelper, Task> executeChangeSet);
    }

    public interface ICRUDOperationsUseCaseFactory<TService>: ICRUDOperationsUseCaseFactory
        where TService: BaseDomainService
    {
        ICRUDOperationsUseCase<TService> Create(TService service, Action<Exception> onError, Action<RowInfo> trackChanges, Func<IServiceOperationsHelper, Task> executeChangeSet);
    }

}
