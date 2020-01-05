using System;

namespace RIAPP.DataService.Core
{
    public class QueryOperationsUseCaseFactory<TService> : IQueryOperationsUseCaseFactory<TService>
        where TService : BaseDomainService
    {
        private readonly Func<BaseDomainService, Action<Exception>, IQueryOperationsUseCase<TService>> _func;

        public QueryOperationsUseCaseFactory(Func<BaseDomainService, Action<Exception>, IQueryOperationsUseCase<TService>> func)
        {
            this._func = func;
        }

        public IQueryOperationsUseCase Create(BaseDomainService service, Action<Exception> onError)
        {
            return this._func(service, onError);
        }

        public IQueryOperationsUseCase<TService> Create(TService service, Action<Exception> onError)
        {
            return this._func(service, onError);
        }

    }
}
