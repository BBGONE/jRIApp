using RIAPP.DataService.Core.Types;

namespace RIAPP.DataService.Core
{
    public interface IInvokeOperationsUseCase : IUseCaseRequestHandler<InvokeRequest, InvokeResponse>
    {
    }

    public interface IInvokeOperationsUseCase<TService> : IInvokeOperationsUseCase
        where TService : BaseDomainService
    {
    }
}
