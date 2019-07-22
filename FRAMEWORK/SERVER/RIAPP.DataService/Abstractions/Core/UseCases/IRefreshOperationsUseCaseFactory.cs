using System;

namespace RIAPP.DataService.Core
{
    public interface IRefreshOperationsUseCaseFactory
    {
        IRefreshOperationsUseCase Create(BaseDomainService service, Action<Exception> onError);
    }
}
