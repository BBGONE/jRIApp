using RIAPP.DataService.Core.Types;

namespace RIAPP.DataService.Core
{
    public interface ICRUDOperationsUseCase : IUseCaseRequestHandler<ChangeSetRequest, ChangeSetResponse>
    {
    }

    public interface ICRUDOperationsUseCase<TService> : ICRUDOperationsUseCase
        where TService : BaseDomainService
    {
    }

}
