using System;

namespace RIAPP.DataService.Core
{
    public class RefreshOperationsUseCaseFactory : IRefreshOperationsUseCaseFactory
    {
        private readonly Func<BaseDomainService, Action<Exception>, IRefreshOperationsUseCase> _func;

        public RefreshOperationsUseCaseFactory(Func<BaseDomainService, Action<Exception>, IRefreshOperationsUseCase> func)
        {
            this._func = func;
        }

        public IRefreshOperationsUseCase Create(BaseDomainService service, Action<Exception> onError)
        {
            return this._func(service, onError);
        }
    }
}
