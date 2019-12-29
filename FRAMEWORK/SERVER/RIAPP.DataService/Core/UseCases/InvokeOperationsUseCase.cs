﻿using Pipeline;
using RIAPP.DataService.Core.Exceptions;
using RIAPP.DataService.Core.Types;
using RIAPP.DataService.Core.UseCases.InvokeMiddleware;
using System;
using System.Reflection;
using System.Threading.Tasks;

namespace RIAPP.DataService.Core
{
    public class InvokeOperationsUseCase<TService> : IInvokeOperationsUseCase<TService>
         where TService : BaseDomainService
    {
        private readonly BaseDomainService _service;
        private readonly IServiceContainer<TService> _serviceContainer;
        private readonly Action<Exception> _onError;
        private readonly RequestDelegate<InvokeContext<TService>> _pipeline;

        public InvokeOperationsUseCase(BaseDomainService service, Action<Exception> onError, RequestDelegate<InvokeContext<TService>> pipeline)
        {
            _serviceContainer = (IServiceContainer<TService>)service.ServiceContainer;
            _service = service;
            _onError = onError ?? throw new ArgumentNullException(nameof(onError));
            _pipeline = pipeline;
        }

        public async Task<bool> Handle(InvokeRequest message, IOutputPort<InvokeResponse> outputPort)
        {
            InvokeResponse response = new InvokeResponse();

            try
            {
                var context = new InvokeContext<TService>(message,
                 response,
                 (TService)_service,
                 _serviceContainer);

                await _pipeline(context);
            }
            catch (Exception ex)
            {
                if (ex is TargetInvocationException)
                    ex = ex.InnerException;

                response.error = new ErrorInfo(ex.GetFullMessage(), ex.GetType().Name);

                _onError(ex);
            }

            outputPort.Handle(response);

            return true;
        }
    }
}
