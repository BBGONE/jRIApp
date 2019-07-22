using System;

namespace RIAPP.DataService.Core
{
    public class InvokeOperationsUseCaseFactory : IInvokeOperationsUseCaseFactory
    {
        private readonly Func<BaseDomainService, Action<Exception>, IInvokeOperationsUseCase> _func;

        public InvokeOperationsUseCaseFactory(Func<BaseDomainService, Action<Exception>, IInvokeOperationsUseCase> func)
        {
            this._func = func;
        }

        public IInvokeOperationsUseCase Create(BaseDomainService service, Action<Exception> onError)
        {
            return this._func(service, onError);
        }
    }
}
