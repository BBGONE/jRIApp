using RIAPP.DataService.Core;
using System;
using System.Threading.Tasks;

namespace Pipeline.Extensions
{
    public static class UseExtensions
    {
        public static IPipelineBuilder<TService, TContext> Use<TService, TContext>(this IPipelineBuilder<TService, TContext> app, Func<TContext, Func<Task>, Task> middleware)
             where TService : BaseDomainService
             where TContext : IRequestContext
        {
            return app.Use(next =>
            {
                return context =>
                {
                    Func<Task> simpleNext = () => next(context);
                    return middleware(context, simpleNext);
                };
            });
        }
    }
}
