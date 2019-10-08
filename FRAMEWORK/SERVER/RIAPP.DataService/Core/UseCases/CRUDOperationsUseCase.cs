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
using System.Threading.Tasks;

namespace RIAPP.DataService.Core
{
    public class CRUDOperationsUseCase<TService> : ICRUDOperationsUseCase<TService>
         where TService : BaseDomainService
    {
        private readonly BaseDomainService _service;
        private readonly RunTimeMetadata _metadata;
        private readonly IServiceContainer<TService> _serviceContainer;
        private readonly IServiceOperationsHelper<TService> _serviceHelper;
        private readonly IAuthorizer<TService> _authorizer;
        private readonly Action<Exception> _onError;
        private readonly Action<RowInfo> _trackChanges;
        private readonly Func<IServiceOperationsHelper, Task> _executeChangeSet;
        
        public CRUDOperationsUseCase(IServiceContainer<TService> serviceContainer, BaseDomainService service, Action<Exception> onError, Action<RowInfo> trackChanges, Func<IServiceOperationsHelper, Task> executeChangeSet)
        {
            _service = service;
            _onError = onError ?? throw new ArgumentNullException(nameof(onError));
            _trackChanges = trackChanges ?? throw new ArgumentNullException(nameof(trackChanges));
            _executeChangeSet = executeChangeSet ?? throw new ArgumentNullException(nameof(executeChangeSet));
            _metadata = this._service.GetMetadata();
            _serviceContainer = serviceContainer;
            _serviceHelper = _serviceContainer.GetServiceHelper();
            _authorizer = _serviceContainer.GetAuthorizer();
        }

        private void CheckRowInfo(RowInfo rowInfo)
        {
            DbSetInfo dbSetInfo = rowInfo.GetDbSetInfo();

            if (dbSetInfo.GetEntityType() == null)
                throw new DomainServiceException(string.Format(ErrorStrings.ERR_DB_ENTITYTYPE_INVALID,
                    dbSetInfo.dbSetName));

            if (rowInfo.changeType == ChangeType.None)
                throw new DomainServiceException(string.Format(ErrorStrings.ERR_REC_CHANGETYPE_INVALID,
                                dbSetInfo.GetEntityType().Name, rowInfo.changeType));
        }

        private RequestContext CreateRequestContext(ChangeSet changeSet, RowInfo rowInfo)
        {
            DbSet dbSet = changeSet.dbSets.Where(d => d.dbSetName == rowInfo.GetDbSetInfo().dbSetName).Single();
            return new RequestContext(_service, changeSet: changeSet, dbSet: dbSet, rowInfo: rowInfo,
                operation: ServiceOperationType.SaveChanges);
        }

        protected virtual async Task AuthorizeChanges(ChangeSet changeSet)
        {
            foreach (DbSet dbSet in changeSet.dbSets)
            {
                //methods on domain service which are attempted to be executed by client (SaveChanges triggers their execution)
                Dictionary<string, MethodInfoData> domainServiceMethods = new Dictionary<string, MethodInfoData>();
                DbSetInfo dbInfo = _metadata.DbSets[dbSet.dbSetName];

                dbSet.rows.Aggregate<RowInfo, Dictionary<string, MethodInfoData>>(domainServiceMethods, (dict, rowInfo) => {
                    MethodInfoData method = rowInfo.GetCRUDMethodInfo(_metadata, dbInfo.dbSetName);
                    if (method == null)
                        throw new DomainServiceException(string.Format(ErrorStrings.ERR_REC_CHANGETYPE_INVALID,
                            dbInfo.GetEntityType().Name, rowInfo.changeType));
                    string dicKey = string.Format("{0}:{1}", method.OwnerType.FullName, method.MethodInfo.Name);
                    if (!dict.ContainsKey(dicKey))
                    {
                        dict.Add(dicKey, method);
                    }
                    return dict;
                });

                await _authorizer.CheckUserRightsToExecute(domainServiceMethods.Values);
            } //foreach (var dbSet in changeSet.dbSets)
        }

        private void Insert(ChangeSet changeSet, ChangeSetGraph graph, RowInfo rowInfo)
        {
            this.CheckRowInfo(rowInfo);
           
            using (var callContext = new RequestCallContext(CreateRequestContext(changeSet, rowInfo)))
            {
                rowInfo.SetChangeState(new EntityChangeState { ParentRows = graph.GetParents(rowInfo) });
                _serviceHelper.InsertEntity(_metadata, rowInfo);
            }
        }

        private void Update(ChangeSet changeSet, RowInfo rowInfo)
        {
            this.CheckRowInfo(rowInfo);

            using (var callContext = new RequestCallContext(CreateRequestContext(changeSet, rowInfo)))
            {
                rowInfo.SetChangeState(new EntityChangeState());
                _serviceHelper.UpdateEntity(_metadata, rowInfo);
            }
        }

        private void Delete(ChangeSet changeSet, RowInfo rowInfo)
        {
            this.CheckRowInfo(rowInfo);

            using (var callContext = new RequestCallContext(CreateRequestContext(changeSet, rowInfo)))
            {
                rowInfo.SetChangeState(new EntityChangeState());
                _serviceHelper.DeleteEntity(_metadata, rowInfo); ;
            }
        }

        private void ApplyChanges(ChangeSet changeSet, ChangeSetGraph graph)
        {
            RowInfo currentRowInfo = null;

            try
            {
                foreach (var rowInfo in graph.InsertList)
                {
                    currentRowInfo = rowInfo;
                    this.Insert(changeSet, graph, rowInfo);
                }

                foreach (RowInfo rowInfo in graph.UpdateList)
                {
                    currentRowInfo = rowInfo;
                    this.Update(changeSet, rowInfo);
                }

                foreach (RowInfo rowInfo in graph.DeleteList)
                {
                    currentRowInfo = rowInfo;
                    this.Delete(changeSet, rowInfo);
                }
            }
            catch (Exception ex)
            {
                if (currentRowInfo != null)
                {
                    object dbEntity = currentRowInfo.GetChangeState()?.Entity;
                    currentRowInfo.SetChangeState(new EntityChangeState { Entity = dbEntity, Error = ex });
                }
                throw;
            }
        }

        private async Task ValidateChanges(ChangeSet changeSet, ChangeSetGraph graph)
        {
            bool hasErrors = false;

            // Validation step
            foreach (RowInfo rowInfo in graph.InsertList)
            {
                var req = CreateRequestContext(changeSet, rowInfo);
                using (var callContext = new RequestCallContext(req))
                {
                    if (!await _serviceHelper.ValidateEntity(_metadata, req))
                    {
                        rowInfo.invalid = rowInfo.GetChangeState().ValidationErrors;
                        hasErrors = true;
                    }
                }
            }

            // Validation step
            foreach (var rowInfo in graph.UpdateList)
            {
                var req = CreateRequestContext(changeSet, rowInfo);
                using (var callContext = new RequestCallContext(req))
                {
                    if (!await _serviceHelper.ValidateEntity(_metadata, req))
                    {
                        rowInfo.invalid = rowInfo.GetChangeState().ValidationErrors;
                        hasErrors = true;
                    }
                }
            }

           if (hasErrors)
                throw new ValidationException(ErrorStrings.ERR_SVC_CHANGES_ARENOT_VALID);
        }

        private async Task CommitChanges(ChangeSet changeSet, ChangeSetGraph graph)
        {
            var req = new RequestContext(_service, changeSet: changeSet, operation: ServiceOperationType.SaveChanges);
            using (var callContext = new RequestCallContext(req))
            {
                await _executeChangeSet(_serviceHelper);

                foreach (RowInfo rowInfo in graph.AllList)
                {
                    if (rowInfo.changeType != ChangeType.Deleted)
                        _serviceHelper.UpdateRowInfoAfterUpdates(rowInfo);
                    else
                        rowInfo.values = null;
                }
            }
        }

        private void TrackChanges(ChangeSetGraph graph)
        {
            foreach (RowInfo rowInfo in graph.AllList)
            {
                _trackChanges(rowInfo);
            }
        }

        public async Task<bool> Handle(ChangeSet message, IOutputPort<ChangeSet> outputPort)
        {
            try
            {
                await AuthorizeChanges(message);

                ChangeSetGraph graph = new ChangeSetGraph(message, _metadata);
                graph.Prepare();

                this.ApplyChanges(message, graph);

                await this.ValidateChanges(message, graph);

                await this.CommitChanges(message, graph);

                this.TrackChanges(graph);
            }
            catch (Exception ex)
            {
                if (ex is TargetInvocationException)
                    ex = ex.InnerException;
                message.error = new ErrorInfo(ex.GetFullMessage(), ex.GetType().Name);
                _onError(ex);
            }

            outputPort.Handle(message);

            return message.error == null;
        }
    }
}
