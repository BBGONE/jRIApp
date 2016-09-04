using System;
using System.Dynamic;
using System.Security.Principal;
using RIAPP.DataService.DomainService.Interfaces;
using RIAPP.DataService.DomainService.Types;
using RIAPP.DataService.Utils;

namespace RIAPP.DataService.DomainService
{
    public class RequestContext : IEntityVersionProvider
    {
        public RequestContext(BaseDomainService dataService,
            DbSet dbSet = null,
            ChangeSet changeSet = null,
            RowInfo rowInfo = null,
            QueryRequest queryInfo = null,
            ServiceOperationType operation = ServiceOperationType.None)
        {
            DataService = dataService;
            CurrentDbSet = dbSet;
            CurrentChangeSet = changeSet;
            CurrentRowInfo = rowInfo;
            CurrentQueryInfo = queryInfo;
            CurrentOperation = operation;
            _dataBag = null;
        }

        public static RequestContext Current
        {
            get
            {
                var reqCtxt = RequestCallContext.CurrentContext;
                if (reqCtxt == null)
                    throw new InvalidOperationException("RequestCallContext == null");
                return reqCtxt;
            }
        }

        public IPrincipal User
        {
            get { return DataService.User; }
        }

        public DbSet CurrentDbSet { get; }

        public ChangeSet CurrentChangeSet { get; }

        public RowInfo CurrentRowInfo { get; }

        public QueryRequest CurrentQueryInfo { get; }

        public ServiceOperationType CurrentOperation { get; }

        public dynamic DataBag
        {
            get
            {
                if (_dataBag == null)
                    _dataBag = new ExpandoObject();
                return _dataBag;
            }
        }

        private IServiceOperationsHelper ServiceHelper
        {
            get { return DataService.ServiceHelper; }
        }

        public BaseDomainService DataService { get; }

        #region private fields

        private dynamic _dataBag;

        #endregion

        #region IEntityVersionProvider

        object IEntityVersionProvider.GetOriginal()
        {
            return ServiceHelper.GetOriginalEntity(CurrentRowInfo);
        }

        public object GetParent(Type entityType)
        {
            return ServiceHelper.GetParentEntity(entityType, CurrentRowInfo);
        }

        public TModel GetOriginal<TModel>()
            where TModel : class
        {
            return ServiceHelper.GetOriginalEntity<TModel>(CurrentRowInfo);
        }

        public TModel GetParent<TModel>()
            where TModel : class
        {
            return ServiceHelper.GetParentEntity<TModel>(CurrentRowInfo);
        }

        #endregion
    }
}