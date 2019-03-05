using RIAPP.DataService.Core.CodeGen;
using RIAPP.DataService.Core.Exceptions;
using RIAPP.DataService.Core.Metadata;
using RIAPP.DataService.Core.Security;
using RIAPP.DataService.Core.Types;
using RIAPP.DataService.Resources;
using RIAPP.DataService.Utils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Security.Principal;
using System.Threading.Tasks;

namespace RIAPP.DataService.Core
{
    public abstract class BaseDomainService : IDomainService, IDataServiceComponent
    {
        private readonly object _lockObj = new  object();

        public BaseDomainService(IServiceContainer serviceContainer)
        {
            this.ServiceContainer = serviceContainer;
        }

        public IPrincipal User
        {
            get
            {
                return this.ServiceContainer.UserProvider.User;
            }
        }

        public ISerializer Serializer
        {
            get
            {
                return this.ServiceContainer.Serializer;
            }
        }

        public IServiceContainer ServiceContainer
        {
            get;
        }

        public RunTimeMetadata GetMetadata()
        {
            return MetadataHelper.GetInitializedMetadata(this);
        }

        protected internal void _OnError(Exception ex)
        {
            if (ex is DummyException)
                return;
            OnError(ex);
        }

        #region Overridable Methods
        protected internal abstract DesignTimeMetadata GetDesignTimeMetadata(bool isDraft);
      
        /// <summary>
        ///     Can be used for tracking what is changed by CRUD methods
        /// </summary>
        /// <param name="dbSetName">name of the entity which is currently tracked</param>
        /// <param name="changeType">enum meaning which CRUD method was invoked</param>
        /// <param name="diffgram">xml representing values as was before and after CRUD operation</param>
        protected virtual void OnTrackChange(string dbSetName, ChangeType changeType, string diffgram)
        {
        }

        protected virtual void OnError(Exception ex)
        {
        }

        protected abstract Task ExecuteChangeSet();

        protected virtual Task AfterExecuteChangeSet()
        {
            return this.ServiceContainer.GetServiceHelper().AfterExecuteChangeSet();
        }

        protected virtual void ApplyChangesToEntity(RowInfo rowInfo)
        {
            RunTimeMetadata metadata = this.GetMetadata();
            DbSetInfo dbSetInfo = rowInfo.dbSetInfo;
            if (dbSetInfo.EntityType == null)
                throw new DomainServiceException(string.Format(ErrorStrings.ERR_DB_ENTITYTYPE_INVALID,
                    dbSetInfo.dbSetName));
            try
            {
                IServiceOperationsHelper serviceHelper = this.ServiceContainer.GetServiceHelper();
                switch (rowInfo.changeType)
                {
                    case ChangeType.Added:
                        serviceHelper.InsertEntity(metadata, rowInfo);
                        break;
                    case ChangeType.Deleted:
                        serviceHelper.DeleteEntity(metadata, rowInfo);
                        break;
                    case ChangeType.Updated:
                        serviceHelper.UpdateEntity(metadata, rowInfo);
                        break;
                    default:
                        throw new DomainServiceException(string.Format(ErrorStrings.ERR_REC_CHANGETYPE_INVALID,
                            dbSetInfo.EntityType.Name, rowInfo.changeType));
                }
            }
            catch (Exception ex)
            {
                object dbEntity = rowInfo.changeState?.Entity;
                rowInfo.changeState = new EntityChangeState {Entity = dbEntity, Error = ex};
                _OnError(ex);
                throw new DummyException(ex.Message, ex);
            }
        }

        protected virtual void TrackChangesToEntity(RowInfo rowInfo)
        {
            if (!rowInfo.dbSetInfo.isTrackChanges)
                return;

            try
            {
                string[] changed = new string[0];
                switch (rowInfo.changeType)
                {
                    case ChangeType.Updated:
                        {
                            changed = rowInfo.changeState.ChangedFieldNames;
                        }
                        break;
                    default:
                        {
                            changed = rowInfo.dbSetInfo.GetNames().Select(f => f.n).ToArray();
                        }
                        break;
                }

                string[] pknames = rowInfo.dbSetInfo.GetPKFields().Select(f => f.fieldName).ToArray();
                string diffgram = DiffGram.GetDiffGram(rowInfo.changeState.OriginalEntity,
                    rowInfo.changeType == ChangeType.Deleted ? null : rowInfo.changeState.Entity,
                    rowInfo.dbSetInfo.EntityType, changed, pknames, rowInfo.changeType, rowInfo.dbSetInfo.dbSetName);

                OnTrackChange(rowInfo.dbSetInfo.dbSetName, rowInfo.changeType, diffgram);
            }
            catch (Exception ex)
            {
                _OnError(ex);
            }
        }

        protected virtual async Task AuthorizeChangeSet(ChangeSet changeSet)
        {
            RunTimeMetadata metadata = this.GetMetadata();
            foreach (DbSet dbSet in changeSet.dbSets)
            {
                //methods on domain service which are attempted to be executed by client (SaveChanges triggers their execution)
                Dictionary<string, MethodInfoData> domainServiceMethods = new Dictionary<string, MethodInfoData>();
                DbSetInfo dbInfo = metadata.DbSets[dbSet.dbSetName];

                dbSet.rows.Aggregate<RowInfo, Dictionary<string, MethodInfoData>>(domainServiceMethods, (dict, rowInfo) => {
                    MethodInfoData method = rowInfo.GetCRUDMethodInfo(metadata, dbInfo.dbSetName);
                    if (method == null)
                        throw new DomainServiceException(string.Format(ErrorStrings.ERR_REC_CHANGETYPE_INVALID,
                            dbInfo.EntityType.Name, rowInfo.changeType));
                    string dicKey = string.Format("{0}:{1}", method.OwnerType.FullName, method.MethodInfo.Name);
                    if (!dict.ContainsKey(dicKey))
                    {
                        dict.Add(dicKey, method);
                    }
                    return dict;
                });

                IAuthorizer authorizer = ServiceContainer.GetAuthorizer();
                await authorizer.CheckUserRightsToExecute(domainServiceMethods.Values);
            } //foreach (var dbSet in changeSet.dbSets)
        }
        #endregion

        #region DataService Data Operations

        /// <summary>
        ///     Utility method to obtain data from the dataservice's query method
        ///     mainly used to embed data on page load, and fill classifiers for lookup data
        /// </summary>
        /// <param name="dbSetName"></param>
        /// <param name="queryName"></param>
        /// <returns></returns>
        public async Task<QueryResponse> GetQueryData(string dbSetName, string queryName)
        {
            QueryRequest getInfo = new QueryRequest {dbSetName = dbSetName, queryName = queryName};
            return await ServiceGetData(getInfo);
        }

        protected async Task<QueryResponse> ExecQuery(QueryRequest queryInfo)
        {
            RunTimeMetadata metadata = this.GetMetadata();
            MethodDescription method = metadata.GetQueryMethod(queryInfo.dbSetName, queryInfo.queryName);
            IAuthorizer authorizer = ServiceContainer.GetAuthorizer();
            await authorizer.CheckUserRightsToExecute(method.methodData);
            queryInfo.dbSetInfo = metadata.DbSets[queryInfo.dbSetName];
            bool isMultyPageRequest = queryInfo.dbSetInfo.enablePaging && queryInfo.pageCount > 1;

            QueryResult queryResult = null;
            int? totalCount = null;
            LinkedList<object> methParams = new LinkedList<object>();

            for (int i = 0; i < method.parameters.Count; ++i)
            {
                methParams.AddLast(queryInfo.paramInfo.GetValue(method.parameters[i].name, method, ServiceContainer));
            }

            var req = new RequestContext(this, queryInfo: queryInfo, operation: ServiceOperationType.Query);
            using (var callContext = new RequestCallContext(req))
            {
                IServiceOperationsHelper serviceHelper = this.ServiceContainer.GetServiceHelper();
                object instance = serviceHelper.GetMethodOwner(method.methodData);
                object invokeRes = method.methodData.MethodInfo.Invoke(instance, methParams.ToArray());
                queryResult = (QueryResult) await serviceHelper.GetMethodResult(invokeRes).ConfigureAwait(false);


                IEnumerable<object> entities = queryResult.Result;
                totalCount = queryResult.TotalCount;
                RowGenerator rowGenerator = new RowGenerator(queryInfo.dbSetInfo, entities, ServiceContainer.GetDataHelper());
                IEnumerable<Row> rows = rowGenerator.CreateRows();

                SubsetsGenerator subsetsGenerator = new SubsetsGenerator(this);
                SubsetList subResults = subsetsGenerator.CreateSubsets(queryResult.subResults);

                QueryResponse res = new QueryResponse
                {
                    pageIndex = queryInfo.pageIndex,
                    pageCount = queryInfo.pageCount,
                    dbSetName = queryInfo.dbSetName,
                    names = queryInfo.dbSetInfo.GetNames(),
                    totalCount = totalCount,
                    extraInfo = queryResult.extraInfo,
                    rows = rows,
                    subsets = subResults,
                    error = null
                };

                return res;
            }
        }

        protected async Task<bool> ApplyChangeSet(ChangeSet changeSet)
        {
            await AuthorizeChangeSet(changeSet);
            RunTimeMetadata metadata = this.GetMetadata();
            ChangeSetGraph graph = new ChangeSetGraph(changeSet, metadata);
            graph.Prepare();

            foreach (var rowInfo in graph.InsertList)
            {
                DbSet dbSet = changeSet.dbSets.Where(d => d.dbSetName == rowInfo.dbSetInfo.dbSetName).Single();
                var req = new RequestContext(this, changeSet: changeSet, dbSet: dbSet, rowInfo: rowInfo,
                    operation: ServiceOperationType.SaveChanges);
                using (var callContext = new RequestCallContext(req))
                {
                    rowInfo.changeState = new EntityChangeState {ParentRows = graph.GetParents(rowInfo)};
                    ApplyChangesToEntity(rowInfo);
                }
            }

            foreach (RowInfo rowInfo in graph.UpdateList)
            {
                DbSet dbSet = changeSet.dbSets.Where(d => d.dbSetName == rowInfo.dbSetInfo.dbSetName).Single();
                var req = new RequestContext(this, changeSet: changeSet, dbSet: dbSet, rowInfo: rowInfo,
                    operation: ServiceOperationType.SaveChanges);
                using (var callContext = new RequestCallContext(req))
                {
                    rowInfo.changeState = new EntityChangeState();
                    ApplyChangesToEntity(rowInfo);
                }
            }

            foreach (RowInfo rowInfo in graph.DeleteList)
            {
                DbSet dbSet = changeSet.dbSets.Where(d => d.dbSetName == rowInfo.dbSetInfo.dbSetName).Single();
                var req = new RequestContext(this, changeSet: changeSet, dbSet: dbSet, rowInfo: rowInfo,
                    operation: ServiceOperationType.SaveChanges);
                using (var callContext = new RequestCallContext(req))
                {
                    rowInfo.changeState = new EntityChangeState();
                    ApplyChangesToEntity(rowInfo);
                }
            }

            bool hasErrors = false;
            IServiceOperationsHelper serviceHelper = this.ServiceContainer.GetServiceHelper();

            //Validation step
            foreach (RowInfo rowInfo in graph.InsertList)
            {
                DbSet dbSet = changeSet.dbSets.Where(d => d.dbSetName == rowInfo.dbSetInfo.dbSetName).Single();
                var req = new RequestContext(this, changeSet: changeSet, dbSet: dbSet, rowInfo: rowInfo,
                    operation: ServiceOperationType.SaveChanges);
                using (var callContext = new RequestCallContext(req))
                {
                    if (!await serviceHelper.ValidateEntity(metadata, req).ConfigureAwait(false))
                    {
                        rowInfo.invalid = rowInfo.changeState.ValidationErrors;
                        hasErrors = true;
                    }
                }
            }

            //Validation step
            foreach (var rowInfo in graph.UpdateList)
            {
                DbSet dbSet = changeSet.dbSets.Where(d => d.dbSetName == rowInfo.dbSetInfo.dbSetName).Single();
                var req = new RequestContext(this, changeSet: changeSet, dbSet: dbSet, rowInfo: rowInfo,
                    operation: ServiceOperationType.SaveChanges);
                using (var callContext = new RequestCallContext(req))
                {
                    if (!await serviceHelper.ValidateEntity(metadata, req).ConfigureAwait(false))
                    {
                        rowInfo.invalid = rowInfo.changeState.ValidationErrors;
                        hasErrors = true;
                    }
                }
            }

            if (hasErrors)
                return false;

            var reqCntxt = new RequestContext(this, changeSet: changeSet, operation: ServiceOperationType.SaveChanges);
            using (var callContext = new RequestCallContext(reqCntxt))
            {
                await ExecuteChangeSet().ConfigureAwait(false);


                foreach (RowInfo rowInfo in graph.AllList)
                {
                    if (rowInfo.changeType != ChangeType.Deleted)
                        serviceHelper.UpdateRowInfoAfterUpdates(rowInfo);
                    else
                        rowInfo.values = null;
                }


                //Track changes step
                foreach (RowInfo rowInfo in graph.AllList)
                {
                    TrackChangesToEntity(rowInfo);
                }
            }
            //OK, All updates are commited
            return true;
        }

        protected async Task<InvokeResponse> InvokeMethod(InvokeRequest invokeInfo)
        {
            RunTimeMetadata metadata = this.GetMetadata();
            MethodDescription method = metadata.GetInvokeMethod(invokeInfo.methodName);
            IAuthorizer authorizer = ServiceContainer.GetAuthorizer();
            await authorizer.CheckUserRightsToExecute(method.methodData);
            List<object> methParams = new List<object>();
            for (int i = 0; i < method.parameters.Count; ++i)
            {
                methParams.Add(invokeInfo.paramInfo.GetValue(method.parameters[i].name, method, ServiceContainer));
            }
            var req = new RequestContext(this, operation: ServiceOperationType.InvokeMethod);
            using (var callContext = new RequestCallContext(req))
            {
                IServiceOperationsHelper serviceHelper = this.ServiceContainer.GetServiceHelper();
                object instance = serviceHelper.GetMethodOwner(method.methodData);
                object invokeRes = method.methodData.MethodInfo.Invoke(instance, methParams.ToArray());
                object meth_result = await serviceHelper.GetMethodResult(invokeRes).ConfigureAwait(false);
                InvokeResponse res = new InvokeResponse();
                if (method.methodResult)
                    res.result = meth_result;
                return res;
            }
        }

        protected async Task<RefreshInfo> RefreshRowInfo(RefreshInfo info)
        {
            RunTimeMetadata metadata = this.GetMetadata();
            info.dbSetInfo = metadata.DbSets[info.dbSetName];
            MethodInfoData methodData = metadata.GetOperationMethodInfo(info.dbSetName, MethodType.Refresh);
            if (methodData == null)
                throw new InvalidOperationException(string.Format(ErrorStrings.ERR_REC_REFRESH_INVALID,
                    info.dbSetInfo.EntityType.Name, GetType().Name));
            info.rowInfo.dbSetInfo = info.dbSetInfo;
            IAuthorizer authorizer = ServiceContainer.GetAuthorizer();
            await authorizer.CheckUserRightsToExecute(methodData);
            var req = new RequestContext(this, rowInfo: info.rowInfo, operation: ServiceOperationType.RowRefresh);
            using (var callContext = new RequestCallContext(req))
            {
                IServiceOperationsHelper serviceHelper = this.ServiceContainer.GetServiceHelper();
                object instance = serviceHelper.GetMethodOwner(methodData);
                object invokeRes = methodData.MethodInfo.Invoke(instance, new object[] { info });
                object dbEntity = await serviceHelper.GetMethodResult(invokeRes).ConfigureAwait(false);

                RefreshInfo rri = new RefreshInfo { rowInfo = info.rowInfo, dbSetName = info.dbSetName };
                if (dbEntity != null)
                {
                    serviceHelper.UpdateRowInfoFromEntity(dbEntity, info.rowInfo);
                } else { 
                    rri.rowInfo = null;
                }

                return rri;
            }
        }

        #endregion

        #region IDomainService Methods

        public string ServiceCodeGen(CodeGenArgs args)
        {
            ICodeGenFactory codeGenfactory = this.ServiceContainer.GetCodeGenFactory();
            try
            {
                ICodeGenProvider codeGen = codeGenfactory.GetCodeGen(this, args.lang);
                return codeGen.GenerateScript(args.comment, args.isDraft);
            }
            catch(Exception ex)
            {
                this._OnError(ex);
                throw;
            }
        }

        public async Task<Permissions> ServiceGetPermissions()
        {
            try
            {
                await Task.CompletedTask;
                RunTimeMetadata metadata = this.GetMetadata();
                Permissions result = new Permissions() { serverTimezone = DateTimeHelper.GetTimezoneOffset() };
                IAuthorizer authorizer = ServiceContainer.GetAuthorizer();
                foreach (var dbInfo in metadata.DbSets.Values)
                {
                    DbSetPermit permissions = await authorizer.GetDbSetPermissions(metadata, dbInfo.dbSetName);
                    result.permissions.Add(permissions);
                }

                return result;
            }
            catch (Exception ex)
            {
                _OnError(ex);
                throw new DummyException(ex.GetFullMessage(), ex);
            }
        }

        public MetadataResult ServiceGetMetadata()
        {
            try
            {
                RunTimeMetadata metadata = this.GetMetadata();
                MetadataResult result = new MetadataResult() { methods = metadata.MethodDescriptions };
                result.associations.AddRange(metadata.Associations.Values);
                result.dbSets.AddRange(metadata.DbSets.Values.OrderBy(d=>d.dbSetName));
                return result;
            }
            catch (Exception ex)
            {
                _OnError(ex);
                throw new DummyException(ex.GetFullMessage(), ex);
            }
        }

        public async Task<QueryResponse> ServiceGetData(QueryRequest queryRequest)
        {
            QueryResponse res = null;
            try
            {
                res = await ExecQuery(queryRequest);
            }
            catch (Exception ex)
            {
                if (ex is TargetInvocationException)
                    ex = ex.InnerException;
                res = new QueryResponse
                {
                    pageIndex = queryRequest.pageIndex,
                    pageCount = queryRequest.pageCount,
                    rows = new Row[0],
                    dbSetName = queryRequest.dbSetName,
                    totalCount = null,
                    error = new ErrorInfo(ex.GetFullMessage(), ex.GetType().Name)
                };
                _OnError(ex);
            }
            return res;
        }

        public async Task<ChangeSet> ServiceApplyChangeSet(ChangeSet changeSet)
        {
            bool res = true;
            try
            {
                res = await ApplyChangeSet(changeSet);
                if (!res)
                {
                    throw new ValidationException(ErrorStrings.ERR_SVC_CHANGES_ARENOT_VALID);
                }
            }
            catch (Exception ex)
            {
                if (ex is TargetInvocationException)
                    ex = ex.InnerException;
                changeSet.error = new ErrorInfo(ex.GetFullMessage(), ex.GetType().Name);
                _OnError(ex);
            }
            return changeSet;
        }

        public async Task<RefreshInfo> ServiceRefreshRow(RefreshInfo refreshInfo)
        {
            RefreshInfo res = null;
            try
            {
                res = await RefreshRowInfo(refreshInfo);
            }
            catch (Exception ex)
            {
                if (ex is System.Reflection.TargetInvocationException)
                    ex = ex.InnerException;
                res = new RefreshInfo
                {
                    dbSetName = refreshInfo.dbSetName,
                    error = new ErrorInfo(ex.GetFullMessage(), ex.GetType().Name),
                    rowInfo = null
                };
                _OnError(ex);
            }
            return res;
        }

        public async Task<InvokeResponse> ServiceInvokeMethod(InvokeRequest parameters)
        {
            InvokeResponse res = null;
            try
            {
                res = await InvokeMethod(parameters);
            }
            catch (Exception ex)
            {
                if (ex is TargetInvocationException)
                    ex = ex.InnerException;
                res = new InvokeResponse {
                    result = null,
                    error = new ErrorInfo(ex.GetFullMessage(), ex.GetType().Name)
                };
                _OnError(ex);
            }
            return res;
        }
        #endregion

        #region IDisposable Members

        protected virtual void Dispose(bool isDisposing)
        {
           // NOOP
        }

        void IDisposable.Dispose()
        {
            Dispose(true);
        }

        #endregion
    }
}