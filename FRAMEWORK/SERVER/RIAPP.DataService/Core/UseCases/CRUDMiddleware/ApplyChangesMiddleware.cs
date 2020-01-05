using Pipeline;
using RIAPP.DataService.Core.Exceptions;
using RIAPP.DataService.Core.Metadata;
using RIAPP.DataService.Core.Types;
using RIAPP.DataService.Resources;
using RIAPP.DataService.Utils;
using System;
using System.Threading.Tasks;

namespace RIAPP.DataService.Core.UseCases.CRUDMiddleware
{
    public class ApplyChangesMiddleware<TService>
         where TService : BaseDomainService
    {
        private readonly RequestDelegate<CRUDContext<TService>> _next;

        public ApplyChangesMiddleware(RequestDelegate<CRUDContext<TService>> next, CRUDMiddlewareOptions<TService> options)
        {
            _next = next;
        }

        private void CheckRowInfo(RowInfo rowInfo)
        {
            DbSetInfo dbSetInfo = rowInfo.GetDbSetInfo();

            if (dbSetInfo.GetEntityType() == null)
            {
                throw new DomainServiceException(string.Format(ErrorStrings.ERR_DB_ENTITYTYPE_INVALID,
                    dbSetInfo.dbSetName));
            }

            if (rowInfo.changeType == ChangeType.None)
            {
                throw new DomainServiceException(string.Format(ErrorStrings.ERR_REC_CHANGETYPE_INVALID,
                                dbSetInfo.GetEntityType().Name, rowInfo.changeType));
            }
        }

        private void Insert(CRUDContext<TService> ctx, RunTimeMetadata metadata, ChangeSetRequest changeSet, IChangeSetGraph graph, RowInfo rowInfo)
        {
            var service = ctx.Service;
            var serviceHelper = ctx.ServiceContainer.GetServiceHelper();

            this.CheckRowInfo(rowInfo);

            using (var callContext = new RequestCallContext(CRUDContext<TService>.CreateRequestContext(service, changeSet, rowInfo)))
            {
                rowInfo.SetChangeState(new EntityChangeState { ParentRows = graph.GetParents(rowInfo) });
                serviceHelper.InsertEntity(metadata, rowInfo);
            }
        }

        private void Update(CRUDContext<TService> ctx, RunTimeMetadata metadata, ChangeSetRequest changeSet, RowInfo rowInfo)
        {
            var service = ctx.Service;
            var serviceHelper = ctx.ServiceContainer.GetServiceHelper();

            this.CheckRowInfo(rowInfo);

            using (var callContext = new RequestCallContext(CRUDContext<TService>.CreateRequestContext(service, changeSet, rowInfo)))
            {
                rowInfo.SetChangeState(new EntityChangeState());
                serviceHelper.UpdateEntity(metadata, rowInfo);
            }
        }

        private void Delete(CRUDContext<TService> ctx, RunTimeMetadata metadata, ChangeSetRequest changeSet, RowInfo rowInfo)
        {
            var service = ctx.Service;
            var serviceHelper = ctx.ServiceContainer.GetServiceHelper();

            this.CheckRowInfo(rowInfo);

            using (var callContext = new RequestCallContext(CRUDContext<TService>.CreateRequestContext(service, changeSet, rowInfo)))
            {
                rowInfo.SetChangeState(new EntityChangeState());
                serviceHelper.DeleteEntity(metadata, rowInfo); ;
            }
        }

        public async Task Invoke(CRUDContext<TService> ctx)
        {
            var serviceHelper = ctx.ServiceContainer.GetServiceHelper();
            var metadata = ctx.Service.GetMetadata();
            var changeSet = ctx.Request;

            ChangeSetGraph graph = new ChangeSetGraph(ctx.Request, metadata);
            graph.Prepare();
            ctx.Properties.Add(CRUDContext<TService>.CHANGE_GRAPH_KEY, graph);

            RowInfo currentRowInfo = null;

            try
            {
                foreach (var rowInfo in graph.InsertList)
                {
                    currentRowInfo = rowInfo;
                    this.Insert(ctx, metadata, changeSet, graph, rowInfo);
                }

                foreach (RowInfo rowInfo in graph.UpdateList)
                {
                    currentRowInfo = rowInfo;
                    this.Update(ctx, metadata, changeSet, rowInfo);
                }

                foreach (RowInfo rowInfo in graph.DeleteList)
                {
                    currentRowInfo = rowInfo;
                    this.Delete(ctx, metadata, changeSet, rowInfo);
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

            await _next(ctx);
        }
    }
}
