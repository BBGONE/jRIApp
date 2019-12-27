using RIAPP.DataService.Core;
using System;

namespace Pipeline
{
    public interface IPipelineBuilder<TService, TContext>
         where TService : BaseDomainService
         where TContext : IRequestContext
    {
        IServiceProvider ApplicationServices { get; }
        RequestDelegate<TContext> Build();
        PipelineBuilder<TService, TContext> New();
        PipelineBuilder<TService, TContext> Use(Func<RequestDelegate<TContext>, RequestDelegate<TContext>> component);
    }
}