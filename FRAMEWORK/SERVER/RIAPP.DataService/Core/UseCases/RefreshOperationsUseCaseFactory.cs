﻿using System;

namespace RIAPP.DataService.Core
{
    public class RefreshOperationsUseCaseFactory<TService> : IRefreshOperationsUseCaseFactory<TService>
        where TService : BaseDomainService
    {
        private readonly Func<BaseDomainService, Action<Exception>, IRefreshOperationsUseCase<TService>> _func;

        public RefreshOperationsUseCaseFactory(Func<BaseDomainService, Action<Exception>, IRefreshOperationsUseCase<TService>> func)
        {
            this._func = func;
        }

        public IRefreshOperationsUseCase Create(BaseDomainService service, Action<Exception> onError)
        {
            return this._func(service, onError);
        }

        public IRefreshOperationsUseCase<TService> Create(TService service, Action<Exception> onError)
        {
            return this._func(service, onError);
        }
    }
}
