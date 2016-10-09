using System;
using System.Collections.Generic;
using System.Collections.Concurrent;
using System.Linq;
using System.Reflection;
using System.Security.Principal;
using System.Threading.Tasks;
using RIAPP.DataService.DomainService.Config;
using RIAPP.DataService.DomainService.Exceptions;
using RIAPP.DataService.DomainService.Interfaces;
using RIAPP.DataService.DomainService.Security;
using RIAPP.DataService.DomainService.Types;
using RIAPP.DataService.Resources;
using RIAPP.DataService.Utils;
using RIAPP.DataService.Utils.CodeGen;
using RIAPP.DataService.Utils.Extensions;
using RIAPP.DataService.Utils.Interfaces;
using System.Threading;

namespace RIAPP.DataService.DomainService
{
    public abstract class BaseDomainService : IDomainService, IServicesProvider
    {
        private readonly object _lockObj = new  object();
        private readonly IPrincipal _User;
        protected readonly ISerializer serializer;
        private bool _IsCodeGenEnabled;
        private ConcurrentDictionary<string, Func<ICodeGenProvider>> _codeGenProviders;
        private IServiceContainer _serviceContainer;
        private IServiceOperationsHelper _serviceHelper;

        public BaseDomainService(IServiceArgs args)
        {
            this.serializer = args.serializer;
            if (this.serializer == null)
                throw new ArgumentException(ErrorStrings.ERR_NO_SERIALIZER);
            this._User = args.principal;
            this._IsCodeGenEnabled = false;
            this._codeGenProviders = null;
            this._serviceContainer = this.CreateServiceContainer();
            this._serviceHelper = this.CreateServiceHelper();
        }

        public IPrincipal User
        {
            get
            {
                return this._User;
            }
        }

        public bool IsCodeGenEnabled
        {
            get
            {
                return this._IsCodeGenEnabled;
            }
            protected set
            {
                this._IsCodeGenEnabled = value;
            }
        }

        public IServiceContainer ServiceContainer
        {
            get
            {
                return this._serviceContainer;
            }
        }

        protected internal IServiceOperationsHelper ServiceHelper
        {
            get
            {
                return this._serviceHelper;
            }
        }

        protected void AddOrReplaceCodeGen(string lang, Func<ICodeGenProvider> providerFactory)
        {
            this._codeGenProviders.AddOrUpdate(lang, providerFactory, (k, old) => { return providerFactory; });
        }

        protected internal void _OnError(Exception ex)
        {
            if (ex is DummyException)
                return;
            OnError(ex);
        }

        #region Overridable Methods
        protected virtual void ConfigureCodeGen()
        {
            this.AddOrReplaceCodeGen("xaml", () => new XamlProvider(this));
        }

        protected virtual IServiceContainer CreateServiceContainer()
        {
            return new ServiceContainerFactory().CreateServiceContainer(GetType(), this.serializer, User);
        }

        protected virtual IServiceOperationsHelper CreateServiceHelper()
        {
            return new ServiceOperationsHelper(this);
        }

        protected internal abstract Metadata GetMetadata(bool isDraft);

        protected internal virtual void Bootstrap(ServiceConfig config)
        {
            //noop
        }

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
            return _serviceHelper.AfterExecuteChangeSet();
        }

        protected virtual void ApplyChangesToEntity(RowInfo rowInfo)
        {
            var metadata = MetadataHelper.GetInitializedMetadata(this);
            var dbSetInfo = rowInfo.dbSetInfo;
            if (dbSetInfo.EntityType == null)
                throw new DomainServiceException(string.Format(ErrorStrings.ERR_DB_ENTITYTYPE_INVALID,
                    dbSetInfo.dbSetName));
            try
            {
                switch (rowInfo.changeType)
                {
                    case ChangeType.Added:
                        _serviceHelper.InsertEntity(metadata, rowInfo);
                        break;
                    case ChangeType.Deleted:
                        _serviceHelper.DeleteEntity(metadata, rowInfo);
                        break;
                    case ChangeType.Updated:
                        _serviceHelper.UpdateEntity(metadata, rowInfo);
                        break;
                    default:
                        throw new DomainServiceException(string.Format(ErrorStrings.ERR_REC_CHANGETYPE_INVALID,
                            dbSetInfo.EntityType.Name, rowInfo.changeType));
                }
            }
            catch (Exception ex)
            {
                var dbEntity = rowInfo.changeState == null ? null : rowInfo.changeState.Entity;
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
                var diffgram = DiffGram.GetDiffGram(rowInfo.changeState.OriginalEntity, rowInfo.changeState.Entity,
                    rowInfo.dbSetInfo.EntityType, rowInfo.changeState.NamesOfChangedFields);
                OnTrackChange(rowInfo.dbSetInfo.dbSetName, rowInfo.changeType, diffgram);
            }
            catch (Exception ex)
            {
                _OnError(ex);
            }
        }

        protected virtual void AuthorizeChangeSet(ChangeSet changeSet)
        {
            var metadata = MetadataHelper.GetInitializedMetadata(this);
            foreach (var dbSet in changeSet.dbSets)
            {
                //methods on domain service which are attempted to be executed by client (SaveChanges triggers their execution)
                var domainServiceMethods = new Dictionary<string, MethodInfoData>();
                var dbInfo = metadata.dbSets[dbSet.dbSetName];

                foreach (var rowInfo in dbSet.rows)
                {
                    var method = SecurityHelper.GetCRUDMethodInfo(metadata, dbInfo.dbSetName, rowInfo);
                    if (method == null)
                        throw new DomainServiceException(string.Format(ErrorStrings.ERR_REC_CHANGETYPE_INVALID,
                            dbInfo.EntityType.Name, rowInfo.changeType));
                    var dicKey = string.Format("{0}:{1}", method.ownerType.FullName, method.methodInfo.Name);
                    if (!domainServiceMethods.ContainsKey(dicKey))
                    {
                        domainServiceMethods.Add(dicKey, method);
                    }
                } // foreach (RowInfo rowInfo in dbSet.rows)

                var authorizer = ServiceContainer.Authorizer;
                authorizer.CheckUserRightsToExecute(domainServiceMethods.Values);
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
        public QueryResponse GetQueryData(string dbSetName, string queryName)
        {
            var getInfo = new QueryRequest {dbSetName = dbSetName, queryName = queryName};
            return ServiceGetData(getInfo).Result;
        }

        protected async Task<QueryResponse> ExecQuery(QueryRequest queryInfo)
        {
            var metadata = MetadataHelper.GetInitializedMetadata(this);
            var method = metadata.GetQueryMethod(queryInfo.dbSetName, queryInfo.queryName);
            var authorizer = ServiceContainer.Authorizer;
            authorizer.CheckUserRightsToExecute(method.methodData);
            queryInfo.dbSetInfo = metadata.dbSets[queryInfo.dbSetName];
            var isMultyPageRequest = queryInfo.dbSetInfo.enablePaging && queryInfo.pageCount > 1;

            QueryResult queryResult = null;
            int? totalCount = null;
            var methParams = new LinkedList<object>();

            for (var i = 0; i < method.parameters.Count; ++i)
            {
                methParams.AddLast(queryInfo.paramInfo.GetValue(method.parameters[i].name, method, ServiceContainer));
            }

            var req = new RequestContext(this, queryInfo: queryInfo, operation: ServiceOperationType.Query);
            using (var callContext = new RequestCallContext(req))
            {
                var instance = _serviceHelper.GetMethodOwner(method.methodData);
                var invokeRes = method.methodData.methodInfo.Invoke(instance, methParams.ToArray());
                queryResult = (QueryResult) await ServiceOperationsHelper.GetMethodResult(invokeRes).ConfigureAwait(false);


                var entities = queryResult.Result;
                totalCount = queryResult.TotalCount;
                var rowGenerator = new RowGenerator(queryInfo.dbSetInfo, entities, ServiceContainer.DataHelper);
                var rows = rowGenerator.CreateRows();

                var subsetsGenerator = new SubsetsGenerator(this);
                var subsets1 = subsetsGenerator.CreateSubsets(queryInfo.dbSetInfo, entities, queryResult.includeNavigations);
                var subsets2 = subsetsGenerator.CreateSubsets(queryResult.subResults);

                var subResults = subsets1.Aggregate(subsets2, (lst, subRes) =>
                {
                    if (lst.Any(r => r.dbSetName == subRes.dbSetName))
                        throw new DomainServiceException(string.Format("The included results already have {0} entities", subRes.dbSetName));
                    lst.Add(subRes);
                    return lst;
                });

                var res = new QueryResponse
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
            AuthorizeChangeSet(changeSet);
            var metadata = MetadataHelper.GetInitializedMetadata(this);
            var graph = new ChangeSetGraph(changeSet, metadata);
            graph.Prepare();

            foreach (var rowInfo in graph.insertList)
            {
                var dbSet = changeSet.dbSets.Where(d => d.dbSetName == rowInfo.dbSetInfo.dbSetName).Single();
                var req = new RequestContext(this, changeSet: changeSet, dbSet: dbSet, rowInfo: rowInfo,
                    operation: ServiceOperationType.SaveChanges);
                using (var callContext = new RequestCallContext(req))
                {
                    rowInfo.changeState = new EntityChangeState {ParentRows = graph.GetParents(rowInfo)};
                    ApplyChangesToEntity(rowInfo);
                }
            }

            foreach (var rowInfo in graph.updateList)
            {
                var dbSet = changeSet.dbSets.Where(d => d.dbSetName == rowInfo.dbSetInfo.dbSetName).Single();
                var req = new RequestContext(this, changeSet: changeSet, dbSet: dbSet, rowInfo: rowInfo,
                    operation: ServiceOperationType.SaveChanges);
                using (var callContext = new RequestCallContext(req))
                {
                    rowInfo.changeState = new EntityChangeState();
                    ApplyChangesToEntity(rowInfo);
                }
            }

            foreach (var rowInfo in graph.deleteList)
            {
                var dbSet = changeSet.dbSets.Where(d => d.dbSetName == rowInfo.dbSetInfo.dbSetName).Single();
                var req = new RequestContext(this, changeSet: changeSet, dbSet: dbSet, rowInfo: rowInfo,
                    operation: ServiceOperationType.SaveChanges);
                using (var callContext = new RequestCallContext(req))
                {
                    rowInfo.changeState = new EntityChangeState();
                    ApplyChangesToEntity(rowInfo);
                }
            }

            var hasErrors = false;

            //Validation step
            foreach (var rowInfo in graph.insertList)
            {
                var dbSet = changeSet.dbSets.Where(d => d.dbSetName == rowInfo.dbSetInfo.dbSetName).Single();
                var req = new RequestContext(this, changeSet: changeSet, dbSet: dbSet, rowInfo: rowInfo,
                    operation: ServiceOperationType.SaveChanges);
                using (var callContext = new RequestCallContext(req))
                {
                    if (!await _serviceHelper.ValidateEntity(metadata, req).ConfigureAwait(false))
                    {
                        rowInfo.invalid = rowInfo.changeState.ValidationErrors;
                        hasErrors = true;
                    }
                }
            }

            //Validation step
            foreach (var rowInfo in graph.updateList)
            {
                var dbSet = changeSet.dbSets.Where(d => d.dbSetName == rowInfo.dbSetInfo.dbSetName).Single();
                var req = new RequestContext(this, changeSet: changeSet, dbSet: dbSet, rowInfo: rowInfo,
                    operation: ServiceOperationType.SaveChanges);
                using (var callContext = new RequestCallContext(req))
                {
                    if (!await _serviceHelper.ValidateEntity(metadata, req).ConfigureAwait(false))
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


                foreach (var rowInfo in graph.allList)
                {
                    if (rowInfo.changeType != ChangeType.Deleted)
                        _serviceHelper.UpdateRowInfoAfterUpdates(rowInfo);
                    else
                        rowInfo.values = null;
                }


                //Track changes step
                foreach (var rowInfo in graph.allList)
                {
                    TrackChangesToEntity(rowInfo);
                }
            }
            //OK, All updates are commited
            return true;
        }

        protected async Task<InvokeResponse> InvokeMethod(InvokeRequest invokeInfo)
        {
            var metadata = MetadataHelper.GetInitializedMetadata(this);
            var method = metadata.GetInvokeMethod(invokeInfo.methodName);
            var authorizer = ServiceContainer.Authorizer;
            authorizer.CheckUserRightsToExecute(method.methodData);
            var methParams = new List<object>();
            for (var i = 0; i < method.parameters.Count; ++i)
            {
                methParams.Add(invokeInfo.paramInfo.GetValue(method.parameters[i].name, method, ServiceContainer));
            }
            var req = new RequestContext(this, operation: ServiceOperationType.InvokeMethod);
            using (var callContext = new RequestCallContext(req))
            {
                var instance = _serviceHelper.GetMethodOwner(method.methodData);
                var invokeRes = method.methodData.methodInfo.Invoke(instance, methParams.ToArray());
                var meth_result = await ServiceOperationsHelper.GetMethodResult(invokeRes).ConfigureAwait(false);
                var res = new InvokeResponse();
                if (method.methodResult)
                    res.result = meth_result;
                return res;
            }
        }

        protected async Task<RefreshInfo> RefreshRowInfo(RefreshInfo info)
        {
            var metadata = MetadataHelper.GetInitializedMetadata(this);
            info.dbSetInfo = metadata.dbSets[info.dbSetName];
            var methodData = metadata.getOperationMethodInfo(info.dbSetName, MethodType.Refresh);
            if (methodData == null)
                throw new InvalidOperationException(string.Format(ErrorStrings.ERR_REC_REFRESH_INVALID,
                    info.dbSetInfo.EntityType.Name, GetType().Name));
            info.rowInfo.dbSetInfo = info.dbSetInfo;
            var authorizer = ServiceContainer.Authorizer;
            authorizer.CheckUserRightsToExecute(methodData);
            var req = new RequestContext(this, rowInfo: info.rowInfo, operation: ServiceOperationType.RowRefresh);
            using (var callContext = new RequestCallContext(req))
            {
                var instance = _serviceHelper.GetMethodOwner(methodData);
                var invokeRes = methodData.methodInfo.Invoke(instance, new object[] {info});
                var dbEntity = await ServiceOperationsHelper.GetMethodResult(invokeRes).ConfigureAwait(false);

                var rri = new RefreshInfo {rowInfo = info.rowInfo, dbSetName = info.dbSetName};
                if (dbEntity != null)
                {
                    _serviceHelper.UpdateRowInfoFromEntity(dbEntity, info.rowInfo);
                }
                else
                    rri.rowInfo = null;

                return rri;
            }
        }

        #endregion

        #region IDomainService Methods

        public string ServiceCodeGen(CodeGenArgs args)
        {
            lock (this._lockObj)
            {
                if (this._codeGenProviders == null)
                {
                    try
                    {
                        this._codeGenProviders = new ConcurrentDictionary<string, Func<ICodeGenProvider>>();
                        this.ConfigureCodeGen();
                    }
                    catch(Exception ex)
                    {
                        //if not properly initialized then reset to null
                        this._codeGenProviders = null;
                        this._OnError(ex);
                        throw;
                    }
                }
            }

            try
            {
                if (!this.IsCodeGenEnabled)
                    throw new InvalidOperationException(ErrorStrings.ERR_CODEGEN_DISABLED);

                var metadata = MetadataHelper.GetInitializedMetadata(this);

                Func<ICodeGenProvider> providerFactory = null;
                if (!this._codeGenProviders.TryGetValue(args.lang, out providerFactory))
                    throw new InvalidOperationException(string.Format(ErrorStrings.ERR_CODEGEN_NOT_IMPLEMENTED,
                        args.lang));

                return providerFactory().GetScript(args.comment, args.isDraft);
            }
            catch(Exception ex)
            {
                this._OnError(ex);
                throw;
            }
        }

        public Permissions ServiceGetPermissions()
        {
            try
            {
                var metadata = MetadataHelper.GetInitializedMetadata(this);
                var result = new Permissions();
                result.serverTimezone = DateTimeHelper.GetTimezoneOffset();
                var authorizer = ServiceContainer.Authorizer;
                foreach (var dbInfo in metadata.dbSets.Values)
                {
                    var permissions = SecurityHelper.GetDbSetPermissions(metadata, dbInfo.dbSetName, authorizer);
                    result.permissions.Add(permissions);
                }

                return result;
            }
            catch (Exception ex)
            {
                _OnError(ex);
                throw new DummyException(ex.Message, ex);
            }
        }

        public MetadataResult ServiceGetMetadata()
        {
            try
            {
                var metadata = MetadataHelper.GetInitializedMetadata(this);
                var result = new MetadataResult();
                result.methods = metadata.methodDescriptions;
                result.associations.AddRange(metadata.associations.Values);
                result.dbSets.AddRange(metadata.dbSets.Values.OrderBy(d=>d.dbSetName));
                return result;
            }
            catch (Exception ex)
            {
                _OnError(ex);
                throw new DummyException(ex.Message, ex);
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
                if (ex is System.Reflection.TargetInvocationException)
                    ex = ex.InnerException;
                res = new QueryResponse
                {
                    pageIndex = queryRequest.pageIndex,
                    pageCount = queryRequest.pageCount,
                    rows = new Row[0],
                    dbSetName = queryRequest.dbSetName,
                    totalCount = null,
                    error = new ErrorInfo(ex.Message, ex.GetType().Name)
                };
                _OnError(ex);
            }
            return res;
        }

        public async Task<ChangeSet> ServiceApplyChangeSet(ChangeSet changeSet)
        {
            var res = true;
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
                if (ex is System.Reflection.TargetInvocationException)
                    ex = ex.InnerException;
                changeSet.error = new ErrorInfo(ex.Message, ex.GetType().Name);
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
                    error = new ErrorInfo(ex.Message, ex.GetType().Name),
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
                if (ex is System.Reflection.TargetInvocationException)
                    ex = ex.InnerException;
                res = new InvokeResponse {result = null, error = new ErrorInfo(ex.Message, ex.GetType().Name)};
                _OnError(ex);
            }
            return res;
        }
        #endregion

        #region IDisposable Members

        protected virtual void Dispose(bool isDisposing)
        {
            if (_serviceHelper is IDisposable && isDisposing)
                (_serviceHelper as IDisposable).Dispose();

            this._serviceHelper = null;
            this._serviceContainer = null;
        }

        void IDisposable.Dispose()
        {
            Dispose(true);
        }

        #endregion
    }
}