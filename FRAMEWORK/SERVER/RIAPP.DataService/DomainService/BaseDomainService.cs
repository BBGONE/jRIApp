using Microsoft.Extensions.DependencyInjection;
using RIAPP.DataService.DomainService.Config;
using RIAPP.DataService.DomainService.Exceptions;
using RIAPP.DataService.DomainService.Interfaces;
using RIAPP.DataService.DomainService.Security;
using RIAPP.DataService.DomainService.Types;
using RIAPP.DataService.Resources;
using RIAPP.DataService.Utils;
using RIAPP.DataService.Utils.Extensions;
using RIAPP.DataService.Utils.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Security.Principal;
using System.Threading;
using System.Threading.Tasks;

namespace RIAPP.DataService.DomainService
{
    public abstract class BaseDomainService : IDomainService, IServicesProviderTmp
    {
        private readonly object _lockObj = new  object();
        private readonly IPrincipal _User;
        protected readonly ISerializer _Serializer;
        private Lazy<IServiceContainer> _ServiceContainer;

        public BaseDomainService(Action<IServiceOptions> optionsInitializer)
        {
            ServiceOptions options = new ServiceOptions(new ServiceCollection());
            optionsInitializer(options);
            if (options.Serializer == null)
                throw new ArgumentException(ErrorStrings.ERR_NO_SERIALIZER);
            if (options.User == null)
                throw new ArgumentException(ErrorStrings.ERR_NO_USER);

            this._Serializer = options.Serializer;
            this._User = options.User;
            this._ServiceContainer = new Lazy<IServiceContainer>(() => {
                this.ConfigureServices(options.Services);
                return new ServiceContainer(options.Services);
            }, true);
        }

        public ServiceConfig Config { get; internal set; }
        
        public IPrincipal User
        {
            get
            {
                return this._User;
            }
        }

        public IServiceContainer ServiceContainer
        {
            get
            {
                return this._ServiceContainer.Value;
            }
        }

        public CachedMetadata GetMetadata()
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
        protected virtual void ConfigureServices(IServiceCollection services)
        {
            services.AddSingleton<ISerializer>(this._Serializer);
            services.AddSingleton<IPrincipal>(this._User);
            services.AddSingleton<IDomainService>(this);
            services.AddSingleton<BaseDomainService>(this);
            services.AddSingleton(this.GetType(), this);
                    
            services.AddSingleton<IAuthorizer, AuthorizerClass>();

            services.AddSingleton<IValueConverter, ValueConverter>();

            services.AddSingleton<IDataHelper, DataHelper>();

            services.AddSingleton<IValidationHelper, ValidationHelper>();

            services.AddSingleton<IServiceOperationsHelper, ServiceOperationsHelper>();

            foreach (var descriptor in this.Config.DataManagerContainer.Descriptors)
            {
                services.AddSingleton(descriptor.ServiceType, descriptor.ImplementationType);
            }
            foreach (var descriptor in this.Config.ValidatorsContainer.Descriptors)
            {
                services.AddSingleton(descriptor.ServiceType, descriptor.ImplementationType);
            }
        }

        protected virtual void ConfigureCodeGen(CodeGenConfig config)
        {
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
            return this.ServiceContainer.ServiceHelper.AfterExecuteChangeSet();
        }

        protected virtual void ApplyChangesToEntity(RowInfo rowInfo)
        {
            var metadata = this.GetMetadata();
            var dbSetInfo = rowInfo.dbSetInfo;
            if (dbSetInfo.EntityType == null)
                throw new DomainServiceException(string.Format(ErrorStrings.ERR_DB_ENTITYTYPE_INVALID,
                    dbSetInfo.dbSetName));
            try
            {
                IServiceOperationsHelper serviceHelper = this.ServiceContainer.ServiceHelper;
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
                string[] changed = rowInfo.changeType == ChangeType.Deleted ? rowInfo.dbSetInfo.GetNames().Select(f => f.n).ToArray() : rowInfo.changeState.NamesOfChangedFields;
                var diffgram = DiffGram.GetDiffGram(rowInfo.changeState.OriginalEntity,
                    rowInfo.changeType == ChangeType.Deleted ? null : rowInfo.changeState.Entity,
                    rowInfo.dbSetInfo.EntityType,
                    changed);
                OnTrackChange(rowInfo.dbSetInfo.dbSetName, rowInfo.changeType, diffgram);
            }
            catch (Exception ex)
            {
                _OnError(ex);
            }
        }

        protected virtual void AuthorizeChangeSet(ChangeSet changeSet)
        {
            var metadata = this.GetMetadata();
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
            var metadata = this.GetMetadata();
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
                IServiceOperationsHelper serviceHelper = this.ServiceContainer.ServiceHelper;
                var instance = serviceHelper.GetMethodOwner(method.methodData);
                var invokeRes = method.methodData.methodInfo.Invoke(instance, methParams.ToArray());
                queryResult = (QueryResult) await serviceHelper.GetMethodResult(invokeRes).ConfigureAwait(false);


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
            var metadata = this.GetMetadata();
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
            IServiceOperationsHelper serviceHelper = this.ServiceContainer.ServiceHelper;

            //Validation step
            foreach (var rowInfo in graph.insertList)
            {
                var dbSet = changeSet.dbSets.Where(d => d.dbSetName == rowInfo.dbSetInfo.dbSetName).Single();
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
            foreach (var rowInfo in graph.updateList)
            {
                var dbSet = changeSet.dbSets.Where(d => d.dbSetName == rowInfo.dbSetInfo.dbSetName).Single();
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


                foreach (var rowInfo in graph.allList)
                {
                    if (rowInfo.changeType != ChangeType.Deleted)
                        serviceHelper.UpdateRowInfoAfterUpdates(rowInfo);
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
            var metadata = this.GetMetadata();
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
                IServiceOperationsHelper serviceHelper = this.ServiceContainer.ServiceHelper;
                var instance = serviceHelper.GetMethodOwner(method.methodData);
                var invokeRes = method.methodData.methodInfo.Invoke(instance, methParams.ToArray());
                var meth_result = await serviceHelper.GetMethodResult(invokeRes).ConfigureAwait(false);
                var res = new InvokeResponse();
                if (method.methodResult)
                    res.result = meth_result;
                return res;
            }
        }

        protected async Task<RefreshInfo> RefreshRowInfo(RefreshInfo info)
        {
            var metadata = this.GetMetadata();
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
                IServiceOperationsHelper serviceHelper = this.ServiceContainer.ServiceHelper;
                var instance = serviceHelper.GetMethodOwner(methodData);
                var invokeRes = methodData.methodInfo.Invoke(instance, new object[] { info });
                var dbEntity = await serviceHelper.GetMethodResult(invokeRes).ConfigureAwait(false);

                var rri = new RefreshInfo { rowInfo = info.rowInfo, dbSetName = info.dbSetName };
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
            CodeGenConfig config = new CodeGenConfig(this);
            try
            {
                this.ConfigureCodeGen(config);
            }
            catch (Exception ex)
            {
                this._OnError(ex);
                throw;
            }

            try
            {
                if (!config.IsCodeGenEnabled)
                    throw new InvalidOperationException(ErrorStrings.ERR_CODEGEN_DISABLED);
                ICodeGenProvider codeGen = config.GetCodeGen(args.lang);
                return codeGen.GetScript(args.comment, args.isDraft);
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
                var metadata = this.GetMetadata();
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
                throw new DummyException(ex.GetFullMessage(), ex);
            }
        }

        public MetadataResult ServiceGetMetadata()
        {
            try
            {
                var metadata = this.GetMetadata();
                var result = new MetadataResult();
                result.methods = metadata.methodDescriptions;
                result.associations.AddRange(metadata.associations.Values);
                result.dbSets.AddRange(metadata.dbSets.Values.OrderBy(d=>d.dbSetName));
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
            Lazy<IServiceContainer> services = Interlocked.Exchange(ref this._ServiceContainer, null);
            if (services == null)
            {
                return;
            }

            if (services.IsValueCreated)
            {
                var disposable = (services.Value as IDisposable);
                if (disposable != null)
                    disposable.Dispose();
            }
        }

        void IDisposable.Dispose()
        {
            Dispose(true);
        }

        #endregion
    }
}