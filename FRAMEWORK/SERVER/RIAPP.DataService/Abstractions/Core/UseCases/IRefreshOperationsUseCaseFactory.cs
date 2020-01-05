using System;

namespace RIAPP.DataService.Core
{
    public interface IRefreshOperationsUseCaseFactory
    {
        IRefreshOperationsUseCase Create(BaseDomainService service, Action<Exception> onError);
    }

    public interface IRefreshOperationsUseCaseFactory<TService> : IRefreshOperationsUseCaseFactory
        where TService : BaseDomainService
    {
        IRefreshOperationsUseCase<TService> Create(TService service, Action<Exception> onError);
    }
}
