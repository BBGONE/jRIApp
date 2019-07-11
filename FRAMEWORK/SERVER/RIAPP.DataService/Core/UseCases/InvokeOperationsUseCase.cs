using RIAPP.DataService.Core.Exceptions;
using RIAPP.DataService.Core.Metadata;
using RIAPP.DataService.Core.Security;
using RIAPP.DataService.Core.Types;
using RIAPP.DataService.Utils;
using System;
using System.Collections.Generic;
using System.Reflection;
using System.Threading.Tasks;

namespace RIAPP.DataService.Core
{
    public class InvokeOperationsUseCase : IInvokeOperationsUseCase
    {
        private readonly BaseDomainService _service;
        private readonly RunTimeMetadata _metadata;
        private readonly IServiceContainer _serviceContainer;
        private readonly IServiceOperationsHelper _serviceHelper;
        private readonly IAuthorizer _authorizer;
        private readonly Action<Exception> _onError;

        public InvokeOperationsUseCase(BaseDomainService service, Action<Exception> onError)
        {
            _service = service;
            _onError = onError ?? throw new ArgumentNullException(nameof(onError));
            _metadata = this._service.GetMetadata();
            _serviceContainer = this._service.ServiceContainer;
            _serviceHelper = _serviceContainer.GetServiceHelper();
            _authorizer = _serviceContainer.GetAuthorizer();
        }

        public async Task<bool> Handle(InvokeRequest message, IOutputPort<InvokeResponse> outputPort)
        {
            try
            {
                MethodDescription method = _metadata.GetInvokeMethod(message.methodName);
                await _authorizer.CheckUserRightsToExecute(method.methodData);
                List<object> methParams = new List<object>();
                for (int i = 0; i < method.parameters.Count; ++i)
                {
                    methParams.Add(message.paramInfo.GetValue(method.parameters[i].name, method, _serviceContainer));
                }
                var req = new RequestContext(_service, operation: ServiceOperationType.InvokeMethod);
                using (var callContext = new RequestCallContext(req))
                {
                    object instance = _serviceHelper.GetMethodOwner(method.methodData);
                    object invokeRes = method.methodData.MethodInfo.Invoke(instance, methParams.ToArray());
                    object meth_result = await _serviceHelper.GetMethodResult(invokeRes);
                    InvokeResponse res = new InvokeResponse();
                    if (method.methodResult)
                        res.result = meth_result;

                    outputPort.Handle(res);
                }
            }
            catch (Exception ex)
            {
                if (ex is TargetInvocationException)
                    ex = ex.InnerException;
                var res = new InvokeResponse
                {
                    result = null,
                    error = new ErrorInfo(ex.GetFullMessage(), ex.GetType().Name)
                };

                outputPort.Handle(res);

                _onError(ex);
            }

            return true;
        }
    }
}
