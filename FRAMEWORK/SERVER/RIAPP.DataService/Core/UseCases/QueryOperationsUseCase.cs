using RIAPP.DataService.Core.Exceptions;
using RIAPP.DataService.Core.Metadata;
using RIAPP.DataService.Core.Security;
using RIAPP.DataService.Core.Types;
using RIAPP.DataService.Utils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace RIAPP.DataService.Core
{
    public class QueryOperationsUseCase<TService> : IQueryOperationsUseCase<TService>
         where TService : BaseDomainService
    {
        private readonly BaseDomainService _service;
        private readonly RunTimeMetadata _metadata;
        private readonly IServiceContainer<TService> _serviceContainer;
        private readonly IServiceOperationsHelper<TService> _serviceHelper;
        private readonly IAuthorizer<TService> _authorizer;
        private readonly IDataHelper<TService> _dataHelper;
        private readonly Action<Exception> _onError;

        public QueryOperationsUseCase(IServiceContainer<TService> serviceContainer, BaseDomainService service, Action<Exception> onError)
        {
            _service = service;
            _onError = onError ?? throw new ArgumentNullException(nameof(onError));
            _metadata = this._service.GetMetadata();
            _serviceContainer = serviceContainer;
            _serviceHelper = _serviceContainer.GetServiceHelper();
            _dataHelper = _serviceContainer.GetDataHelper();
            _authorizer = _serviceContainer.GetAuthorizer();
        }

        public async Task<bool> Handle(QueryRequest message, IOutputPort<QueryResponse> outputPort)
        {
            try
            {
                MethodDescription method = _metadata.GetQueryMethod(message.dbSetName, message.queryName);
                await _authorizer.CheckUserRightsToExecute(method.methodData);
                message.dbSetInfo = _metadata.DbSets[message.dbSetName];
                bool isMultyPageRequest = message.dbSetInfo.enablePaging && message.pageCount > 1;

                QueryResult queryResult = null;
                int? totalCount = null;
                LinkedList<object> methParams = new LinkedList<object>();

                for (int i = 0; i < method.parameters.Count; ++i)
                {
                    methParams.AddLast(message.paramInfo.GetValue(method.parameters[i].name, method, _dataHelper));
                }

                var req = new RequestContext(_service, queryInfo: message, operation: ServiceOperationType.Query);
                using (var callContext = new RequestCallContext(req))
                {
                    object instance = _serviceHelper.GetMethodOwner(method.methodData);
                    object invokeRes = method.methodData.MethodInfo.Invoke(instance, methParams.ToArray());
                    queryResult = (QueryResult)await _serviceHelper.GetMethodResult(invokeRes);


                    IEnumerable<object> entities = queryResult.Result;
                    totalCount = queryResult.TotalCount;
                    RowGenerator rowGenerator = new RowGenerator(message.dbSetInfo, entities, _dataHelper);
                    IEnumerable<Row> rows = rowGenerator.CreateRows();

                    SubsetsGenerator subsetsGenerator = new SubsetsGenerator(_service.GetMetadata(), _dataHelper);
                    SubsetList subResults = subsetsGenerator.CreateSubsets(queryResult.subResults);

                    QueryResponse res = new QueryResponse
                    {
                        pageIndex = message.pageIndex,
                        pageCount = message.pageCount,
                        dbSetName = message.dbSetName,
                        names = message.dbSetInfo.GetNames(),
                        totalCount = totalCount,
                        extraInfo = queryResult.extraInfo,
                        rows = rows,
                        subsets = subResults,
                        error = null
                    };

                    outputPort.Handle(res);
                }
            }
            catch (Exception ex)
            {
                if (ex is TargetInvocationException)
                    ex = ex.InnerException;

                var res = new QueryResponse
                {
                    pageIndex = message.pageIndex,
                    pageCount = message.pageCount,
                    rows = new Row[0],
                    dbSetName = message.dbSetName,
                    totalCount = null,
                    error = new ErrorInfo(ex.GetFullMessage(), ex.GetType().Name)
                };

                outputPort.Handle(res);

                _onError(ex);
            }

            return true;
        }
    }
}
