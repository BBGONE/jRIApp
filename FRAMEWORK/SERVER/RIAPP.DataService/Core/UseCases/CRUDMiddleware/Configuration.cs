using Pipeline;
using Pipeline.Extensions;
using RIAPP.DataService.Core.Types;
using System;
using System.Threading.Tasks;

namespace RIAPP.DataService.Core.UseCases.CRUDMiddleware
{
    public class Configuration
    {
        public static void ConfigureCRUD<TService>(PipelineBuilder<TService, CRUDContext<TService>> builder)
             where TService : BaseDomainService
        {
            CRUDMiddlewareOptions<TService> middlewareOptions = new CRUDMiddlewareOptions<TService>();
            
            builder.UseMiddleware<AuthorizeMiddleware<TService>, TService, CRUDContext<TService>>(middlewareOptions);
            builder.UseMiddleware<ApplyChangesMiddleware<TService>, TService, CRUDContext<TService>>(middlewareOptions);
            builder.UseMiddleware<ValidateChangesMiddleware<TService>, TService, CRUDContext<TService>>(middlewareOptions);
            builder.UseMiddleware<CommitChangesMiddleware<TService>, TService, CRUDContext<TService>>(middlewareOptions);

            builder.Run(ctx =>
            {
                if (!ctx.Properties.TryGetValue(CRUDContext<TService>.CHANGE_GRAPH_KEY, out var graph))
                {
                    throw new Exception("Could not get Graph changes from properties");
                }

                if (!ctx.Properties.TryGetValue(CRUDContext<TService>.CHANGE_METHODS_KEY, out var  serviceMethods))
                {
                    throw new Exception("Could not get Service methods from properties");
                }

                foreach (RowInfo rowInfo in (graph as IChangeSetGraph).AllList)
                {
                    (serviceMethods as CRUDServiceMethods).TrackChanges(rowInfo);
                }
                return Task.CompletedTask;
            });
        }
    }
}
