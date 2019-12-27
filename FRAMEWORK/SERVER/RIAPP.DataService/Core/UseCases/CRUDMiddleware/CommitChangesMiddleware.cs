using Pipeline;
using RIAPP.DataService.Core.Types;
using RIAPP.DataService.Utils;
using System;
using System.Threading.Tasks;

namespace RIAPP.DataService.Core.UseCases.CRUDMiddleware
{
    public class CommitChangesMiddleware<TService>
         where TService : BaseDomainService
    {
        private readonly RequestDelegate<CRUDContext<TService>> _next;

        public CommitChangesMiddleware(RequestDelegate<CRUDContext<TService>> next, CRUDMiddlewareOptions<TService> options)
        {
            _next = next;
        }

        public async Task Invoke(CRUDContext<TService> ctx)
        {
            var serviceHelper = ctx.ServiceContainer.GetServiceHelper();
            var dataHelper = ctx.ServiceContainer.GetDataHelper();
            var metadata = ctx.Service.GetMetadata();
            var changeSet = ctx.Request;

            if (!ctx.Properties.TryGetValue(CRUDContext<TService>.CHANGE_GRAPH_KEY, out var graph))
            {
                throw new Exception("Could not get Graph changes from properties");
            }

            if (!ctx.Properties.TryGetValue(CRUDContext<TService>.CHANGE_METHODS_KEY, out var serviceMethods))
            {
                throw new Exception("Could not get CRUD Service methods from properties");
            }


            var req = CRUDContext<TService>.CreateRequestContext(ctx.Service, changeSet);

            using (var callContext = new RequestCallContext(req))
            {
                await (serviceMethods as CRUDServiceMethods).ExecuteChangeSet();
                await serviceHelper.AfterExecuteChangeSet(changeSet);
                await (serviceMethods as CRUDServiceMethods).AfterChangeSetExecuted();

                foreach (RowInfo rowInfo in (graph as IChangeSetGraph).AllList)
                {
                    if (rowInfo.changeType != ChangeType.Deleted)
                        serviceHelper.UpdateRowInfoAfterUpdates(rowInfo);
                }

                var subResults = new SubResultList();
                await serviceHelper.AfterChangeSetCommited(changeSet, subResults);
                await (serviceMethods as CRUDServiceMethods).AfterChangeSetCommited(subResults);

                SubsetsGenerator subsetsGenerator = new SubsetsGenerator(metadata, dataHelper);
                ctx.Response.subsets = subsetsGenerator.CreateSubsets(subResults);
            }


            await _next(ctx);
        }
    }
}
