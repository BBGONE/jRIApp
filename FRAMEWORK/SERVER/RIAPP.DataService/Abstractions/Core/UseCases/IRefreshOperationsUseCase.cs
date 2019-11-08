using RIAPP.DataService.Core.Types;

namespace RIAPP.DataService.Core
{
    public interface IRefreshOperationsUseCase : IUseCaseRequestHandler<RefreshInfoRequest, RefreshInfoResponse>
    {
    }

    public interface IRefreshOperationsUseCase<TService> : IRefreshOperationsUseCase
        where TService : BaseDomainService
    {
    }
}
