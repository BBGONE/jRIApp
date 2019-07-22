using System;

namespace RIAPP.DataService.Core
{
    public interface IQueryOperationsUseCaseFactory
    {
        IQueryOperationsUseCase Create(BaseDomainService service, Action<Exception> onError);
    }
}