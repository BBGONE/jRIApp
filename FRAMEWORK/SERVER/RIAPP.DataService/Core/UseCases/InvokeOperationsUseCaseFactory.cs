using System;

namespace RIAPP.DataService.Core
{
    public class InvokeOperationsUseCaseFactory<TService> : IInvokeOperationsUseCaseFactory<TService>
        where TService : BaseDomainService
    {
        private readonly Func<BaseDomainService, Action<Exception>, IInvokeOperationsUseCase<TService>> _func;

        public InvokeOperationsUseCaseFactory(Func<BaseDomainService, Action<Exception>, IInvokeOperationsUseCase<TService>> func)
        {
            this._func = func;
        }

        public IInvokeOperationsUseCase Create(BaseDomainService service, Action<Exception> onError)
        {
            return this._func(service, onError);
        }

        public IInvokeOperationsUseCase<TService> Create(TService service, Action<Exception> onError)
        {
            return this._func(service, onError);
        }
    }
}
