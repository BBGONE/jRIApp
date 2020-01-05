using System;

namespace RIAPP.DataService.Core
{
    public interface IInvokeOperationsUseCaseFactory
    {
        IInvokeOperationsUseCase Create(BaseDomainService service, Action<Exception> onError);
    }

    public interface IInvokeOperationsUseCaseFactory<TService> : IInvokeOperationsUseCaseFactory
        where TService : BaseDomainService
    {
        IInvokeOperationsUseCase<TService> Create(TService service, Action<Exception> onError);
    }
}