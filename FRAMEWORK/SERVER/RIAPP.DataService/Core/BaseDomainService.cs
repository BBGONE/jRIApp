using RIAPP.DataService.Core.CodeGen;
using RIAPP.DataService.Core.Exceptions;
using RIAPP.DataService.Core.Metadata;
using RIAPP.DataService.Core.Security;
using RIAPP.DataService.Core.Types;
using RIAPP.DataService.Utils;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace RIAPP.DataService.Core
{
    public abstract class BaseDomainService : IDomainService, IDataServiceComponent
    {
        public BaseDomainService(IServiceContainer serviceContainer)
        {
            this.ServiceContainer = serviceContainer;
        }

        public ClaimsPrincipal User
        {
            get
            {
                return this.ServiceContainer.GetUserProvider().User;
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
            return MetadataHelper.GetInitializedMetadata(this, this.ServiceContainer.DataHelper, this.ServiceContainer.ValueConverter);
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
            return Task.CompletedTask;
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
        
        #endregion

        #region DataService Data Operations

        /// <summary>
        ///     Utility method to obtain data from the dataservice's query method
        ///     mainly used to embed query data on a page load.
        ///     best for small datasets which needs to be present on the client when the page loads
        /// </summary>
        /// <param name="dbSetName"></param>
        /// <param name="queryName"></param>
        /// <returns></returns>
        public async Task<QueryResponse> GetQueryData(string dbSetName, string queryName)
        {
            QueryRequest getInfo = new QueryRequest {dbSetName = dbSetName, queryName = queryName};
            return await ServiceGetData(getInfo);
        }

        #endregion

        #region IDomainService Methods

        public string ServiceCodeGen(CodeGenArgs args)
        {
            ICodeGenFactory codeGenfactory = this.ServiceContainer.CodeGenFactory;
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
                IAuthorizer authorizer = ServiceContainer.Authorizer;
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

        public async Task<QueryResponse> ServiceGetData(QueryRequest message)
        {
            var factory = this.ServiceContainer.QueryOperationsUseCaseFactory;
            IQueryOperationsUseCase uc  = factory.Create(this, (err) => _OnError(err));
            var output = this.ServiceContainer.GetRequiredService<IResponsePresenter<QueryResponse, QueryResponse>>();

            bool res = await uc.Handle(message, output);

            return output.Response;
        }

        public async Task<ChangeSet> ServiceApplyChangeSet(ChangeSet message)
        {
            var factory = this.ServiceContainer.CRUDOperationsUseCaseFactory;
            ICRUDOperationsUseCase uc = factory.Create(this, 
                (err) => this._OnError(err),
                (row) => this.TrackChangesToEntity(row),
                async () =>
                {
                    await this.ExecuteChangeSet();
                    await this.AfterExecuteChangeSet();
                });
            var output = this.ServiceContainer.GetRequiredService<IResponsePresenter<ChangeSet, ChangeSet>>();
            
            bool res = await uc.Handle(message, output);

            return output.Response;
        }

        public async Task<RefreshInfo> ServiceRefreshRow(RefreshInfo message)
        {
            var factory = this.ServiceContainer.RefreshOperationsUseCaseFactory;
            IRefreshOperationsUseCase uc = factory.Create(this, (err) => _OnError(err));
            var output = this.ServiceContainer.GetRequiredService<IResponsePresenter<RefreshInfo, RefreshInfo>>();

            bool res = await uc.Handle(message, output);

            return output.Response;
        }

        public async Task<InvokeResponse> ServiceInvokeMethod(InvokeRequest message)
        {
            var factory = this.ServiceContainer.InvokeOperationsUseCaseFactory;
            IInvokeOperationsUseCase uc = factory.Create(this, (err) => _OnError(err));
            var output = this.ServiceContainer.GetRequiredService<IResponsePresenter<InvokeResponse, InvokeResponse>>();

            bool res = await uc.Handle(message, output);

            return output.Response;
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