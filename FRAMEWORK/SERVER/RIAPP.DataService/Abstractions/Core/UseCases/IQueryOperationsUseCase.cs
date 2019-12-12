using RIAPP.DataService.Core.Types;

namespace RIAPP.DataService.Core
{
    public interface IQueryOperationsUseCase : IUseCaseRequestHandler<QueryRequest, QueryResponse>
    {
    }

    public interface IQueryOperationsUseCase<TService> : IQueryOperationsUseCase
        where TService : BaseDomainService
    {
    }
}
