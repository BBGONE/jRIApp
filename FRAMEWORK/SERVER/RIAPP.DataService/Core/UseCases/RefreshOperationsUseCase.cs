using RIAPP.DataService.Core.Exceptions;
using RIAPP.DataService.Core.Metadata;
using RIAPP.DataService.Core.Security;
using RIAPP.DataService.Core.Types;
using RIAPP.DataService.Resources;
using RIAPP.DataService.Utils;
using System;
using System.Threading.Tasks;

namespace RIAPP.DataService.Core
{
    public class RefreshOperationsUseCase<TService> : IRefreshOperationsUseCase<TService>
         where TService : BaseDomainService
    {
        private readonly BaseDomainService _service;
        private readonly RunTimeMetadata _metadata;
        private readonly IServiceContainer<TService> _serviceContainer;
        private readonly IServiceOperationsHelper<TService> _serviceHelper;
        private readonly IAuthorizer<TService> _authorizer;
        private readonly Action<Exception> _onError;

        public RefreshOperationsUseCase(IServiceContainer<TService> serviceContainer, BaseDomainService service, Action<Exception> onError)
        {
            _service = service;
            _onError = onError ?? throw new ArgumentNullException(nameof(onError));
            _metadata = this._service.GetMetadata();
            _serviceContainer = serviceContainer;
            _serviceHelper = _serviceContainer.GetServiceHelper();
            _authorizer = _serviceContainer.GetAuthorizer();
        }

        public async Task<bool> Handle(RefreshInfoRequest message, IOutputPort<RefreshInfoResponse> outputPort)
        {
            try
            {
                message.SetDbSetInfo(_metadata.DbSets[message.dbSetName]);
                MethodInfoData methodData = _metadata.GetOperationMethodInfo(message.dbSetName, MethodType.Refresh);
                if (methodData == null)
                    throw new InvalidOperationException(string.Format(ErrorStrings.ERR_REC_REFRESH_INVALID,
                        message.GetDbSetInfo().GetEntityType().Name, GetType().Name));
                message.rowInfo.SetDbSetInfo(message.GetDbSetInfo());
                await _authorizer.CheckUserRightsToExecute(methodData);
                var req = new RequestContext(_service, rowInfo: message.rowInfo, operation: ServiceOperationType.RowRefresh);
                using (var callContext = new RequestCallContext(req))
                {
                    object instance = _serviceHelper.GetMethodOwner(methodData);
                    object invokeRes = methodData.MethodInfo.Invoke(instance, new object[] { message });
                    object dbEntity = await _serviceHelper.GetMethodResult(invokeRes);

                    RefreshInfoResponse response = new RefreshInfoResponse { rowInfo = message.rowInfo, dbSetName = message.dbSetName };
                    if (dbEntity != null)
                    {
                        _serviceHelper.UpdateRowInfoFromEntity(dbEntity, message.rowInfo);
                    }
                    else
                    {
                        response.rowInfo = null;
                    }

                    outputPort.Handle(response);
                }
            }
            catch (Exception ex)
            {

                if (ex is System.Reflection.TargetInvocationException)
                    ex = ex.InnerException;

                var response = new RefreshInfoResponse
                {
                    dbSetName = message.dbSetName,
                    error = new ErrorInfo(ex.GetFullMessage(), ex.GetType().Name),
                    rowInfo = null
                };

                outputPort.Handle(response);

                _onError(ex);
            }

            return true;
        }
    }
}
