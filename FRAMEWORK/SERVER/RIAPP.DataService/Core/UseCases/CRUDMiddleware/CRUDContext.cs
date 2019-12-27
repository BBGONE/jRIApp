﻿using Pipeline;
using RIAPP.DataService.Core.Types;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.ExceptionServices;

namespace RIAPP.DataService.Core.UseCases.CRUDMiddleware
{
    public class CRUDContext<TService> : IRequestContext
        where TService : BaseDomainService
    {
        public const string CHANGE_GRAPH_KEY = "change_graph";
        public const string CHANGE_METHODS_KEY = "change_methods";

        private ExceptionDispatchInfo _ExceptionInfo;
        private readonly TService _service;
        private readonly IServiceContainer<TService> _serviceContainer;

        public CRUDContext(
            ChangeSetRequest request, 
            ChangeSetResponse response,
            TService service,
            IServiceContainer<TService> serviceContainer)
        {
            Request = request;
            Response = response;
            _service = service;
            _serviceContainer = serviceContainer;
            _ExceptionInfo = null;
            Properties = new Dictionary<string, object>();
        }

        public static RequestContext CreateRequestContext(TService service, ChangeSetRequest changeSet, RowInfo rowInfo = null)
        {
            DbSet dbSet = rowInfo == null? null : changeSet.dbSets.Where(d => d.dbSetName == rowInfo.GetDbSetInfo().dbSetName).Single();
            return new RequestContext(service, changeSet: changeSet, dbSet: dbSet, rowInfo: rowInfo,
                operation: ServiceOperationType.SaveChanges);
        }

       
        // Gets a key/value collection that can be used to share data between middleware.
        public IDictionary<string, object> Properties { get; }

        public void AddLogItem(string str)
        {
        }

        public ChangeSetRequest Request { get; }
        public ChangeSetResponse Response { get; }
        public IServiceProvider RequestServices { get { return _serviceContainer.ServiceProvider; } }

        public void CaptureException(Exception ex)
        {
            _ExceptionInfo = ExceptionDispatchInfo.Capture(ex);
        }

        public Exception ProcessingException { get { return _ExceptionInfo?.SourceException; } }

        public IServiceContainer<TService> ServiceContainer => _serviceContainer;

        public TService Service => _service;

        public void ReThrow()
        {
            _ExceptionInfo?.Throw();
        }
    }
}
