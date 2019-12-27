using Pipeline;
using RIAPP.DataService.Core.Exceptions;
using RIAPP.DataService.Core.Metadata;
using RIAPP.DataService.Core.Types;
using RIAPP.DataService.Resources;
using RIAPP.DataService.Utils;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RIAPP.DataService.Core.UseCases.CRUDMiddleware
{
    public class ValidateChangesMiddleware<TService>
         where TService : BaseDomainService
    {
        private readonly RequestDelegate<CRUDContext<TService>> _next;

        public ValidateChangesMiddleware(RequestDelegate<CRUDContext<TService>> next, CRUDMiddlewareOptions<TService> options)
        {
            _next = next;
        }

        private async Task<bool> ValidateRows(CRUDContext<TService> ctx, ChangeSetRequest changeSet, RunTimeMetadata metadata, IEnumerable<RowInfo> rows)
        {
            var service = ctx.Service;
            var serviceHelper = ctx.ServiceContainer.GetServiceHelper();

            foreach (RowInfo rowInfo in rows)
            {
                var req = CRUDContext<TService>.CreateRequestContext(service, changeSet, rowInfo);
                using (var callContext = new RequestCallContext(req))
                {
                    if (!await serviceHelper.ValidateEntity(metadata, req))
                    {
                        rowInfo.invalid = rowInfo.GetChangeState().ValidationErrors;
                        return false;
                    }
                }
            }
            return true;
        }

        public async Task Invoke(CRUDContext<TService> ctx)
        {
            var metadata = ctx.Service.GetMetadata();
            var changeSet = ctx.Request;

            if (!ctx.Properties.TryGetValue(CRUDContext<TService>.CHANGE_GRAPH_KEY, out var graph))
            {
                throw new Exception("Could not get Graph changes from properties");
            }
            
            if (!await ValidateRows(ctx, changeSet, metadata, (graph as IChangeSetGraph).InsertList))
            {
                throw new ValidationException(ErrorStrings.ERR_SVC_CHANGES_ARENOT_VALID);
            }

            if (!await ValidateRows(ctx, changeSet, metadata, (graph as IChangeSetGraph).UpdateList))
            {
                throw new ValidationException(ErrorStrings.ERR_SVC_CHANGES_ARENOT_VALID);
            }

            await _next(ctx);
        }
    }
}
