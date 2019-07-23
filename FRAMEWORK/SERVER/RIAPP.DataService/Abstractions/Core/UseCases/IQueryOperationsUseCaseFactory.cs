using System;

namespace RIAPP.DataService.Core
{
    public interface IQueryOperationsUseCaseFactory
    {
        IQueryOperationsUseCase Create(BaseDomainService service, Action<Exception> onError);
    }

    public interface IQueryOperationsUseCaseFactory<TService>: IQueryOperationsUseCaseFactory
        where TService : BaseDomainService
    {
        IQueryOperationsUseCase<TService> Create(TService service, Action<Exception> onError);
    }
}