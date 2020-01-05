using Pipeline;
using RIAPP.DataService.Core.Exceptions;
using RIAPP.DataService.Core.Types;
using RIAPP.DataService.Core.UseCases.QueryMiddleware;
using RIAPP.DataService.Utils.Extensions;
using System;
using System.Reflection;
using System.Threading.Tasks;

namespace RIAPP.DataService.Core
{
    public class QueryOperationsUseCase<TService> : IQueryOperationsUseCase<TService>
         where TService : BaseDomainService
    {
        private readonly BaseDomainService _service;
        private readonly IServiceContainer<TService> _serviceContainer;
        private readonly Action<Exception> _onError;
        private readonly RequestDelegate<QueryContext<TService>> _pipeline;

        public QueryOperationsUseCase(BaseDomainService service, Action<Exception> onError, RequestDelegate<QueryContext<TService>> pipeline)
        {
            _serviceContainer = (IServiceContainer<TService>)service.ServiceContainer;
            _service = service;
            _onError = onError ?? throw new ArgumentNullException(nameof(onError));
            _pipeline = pipeline;
        }

        public async Task<bool> Handle(QueryRequest message, IOutputPort<QueryResponse> outputPort)
        {
            var response = new QueryResponse
            {
                pageIndex = message.pageIndex,
                pageCount = message.pageCount,
                dbSetName = message.dbSetName,
                rows = new Row[0],
                totalCount = null,
                error = null
            };

            try
            {
                var metadata = _service.GetMetadata();
                var dbSetInfo = metadata.DbSets.Get(message.dbSetName) ?? throw new InvalidOperationException($"The DbSet {message.dbSetName} was not found in metadata");
                message.SetDbSetInfo(dbSetInfo);

                bool isMultyPageRequest = dbSetInfo.enablePaging && message.pageCount > 1;

                var context = new QueryContext<TService>(message,
                    response,
                    (TService)_service,
                    _serviceContainer,
                    isMultyPageRequest);

                await _pipeline(context);
            }
            catch (Exception ex)
            {
                if (ex is TargetInvocationException)
                {
                    ex = ex.InnerException;
                }

                response.error = new ErrorInfo(ex.GetFullMessage(), ex.GetType().Name);

                _onError(ex);
            }

            outputPort.Handle(response);

            return true;
        }
    }
}
