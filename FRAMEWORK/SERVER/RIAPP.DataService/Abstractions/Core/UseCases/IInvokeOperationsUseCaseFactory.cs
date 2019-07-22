using System;

namespace RIAPP.DataService.Core
{
    public interface IInvokeOperationsUseCaseFactory
    {
        IInvokeOperationsUseCase Create(BaseDomainService service, Action<Exception> onError);
    }
}