using RIAPP.DataService.Core.Types;

namespace RIAPP.DataService.Core
{
    public interface ICRUDOperationsUseCase : IUseCaseRequestHandler<ChangeSet, ChangeSet>
    {
    }

    public interface ICRUDOperationsUseCase<TService> : ICRUDOperationsUseCase
        where TService : BaseDomainService
    {
    }

}
