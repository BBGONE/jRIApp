using RIAPP.DataService.Core;
using System;

namespace Pipeline.Extensions
{
    public static class RunExtensions
    {
        public static void Run<TService, TContext>(this IPipelineBuilder<TService, TContext> app, RequestDelegate<TContext> handler)
             where TService : BaseDomainService
             where TContext : IRequestContext
        {
            if (app == null)
            {
                throw new ArgumentNullException(nameof(app));
            }

            if (handler == null)
            {
                throw new ArgumentNullException(nameof(handler));
            }

            app.Use(_ => handler);
        }
    }
}
