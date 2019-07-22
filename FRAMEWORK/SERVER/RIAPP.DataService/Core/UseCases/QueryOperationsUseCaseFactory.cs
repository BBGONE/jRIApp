using System;

namespace RIAPP.DataService.Core
{
    public class QueryOperationsUseCaseFactory: IQueryOperationsUseCaseFactory
    {
        private readonly Func<BaseDomainService, Action<Exception>, IQueryOperationsUseCase> _func;

        public QueryOperationsUseCaseFactory(Func<BaseDomainService, Action<Exception>, IQueryOperationsUseCase> func)
        {
            this._func = func;
        }

        public IQueryOperationsUseCase Create(BaseDomainService service, Action<Exception> onError)
        {
            return this._func(service, onError);
        }
    }
}
