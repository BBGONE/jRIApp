using RIAPP.DataService.Core.Types;
using RIAPP.DataService.Utils;
using System;
using System.Dynamic;
using System.Security.Claims;

namespace RIAPP.DataService.Core
{
    public class RequestContext : IEntityVersionProvider
    {
        public RequestContext(BaseDomainService dataService, 
            IServiceOperationsHelper serviceHelper,
            DbSet dbSet = null,
            ChangeSet changeSet = null,
            RowInfo rowInfo = null,
            QueryRequest queryInfo = null,
            ServiceOperationType operation = ServiceOperationType.None)
        {
            DataService = dataService ?? throw new ArgumentNullException(nameof(dataService));
            ServiceHelper = serviceHelper ?? throw new ArgumentNullException(nameof(serviceHelper));
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
                    throw new InvalidOperationException("Current RequestCallContext is null");
                return reqCtxt;
            }
        }

        public ClaimsPrincipal User
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
                return _dataBag.Value;
            }
        }

        public IServiceOperationsHelper ServiceHelper
        {
            get;
        }

        public IDataHelper DataHelper
        {
            get
            {
                return ServiceHelper.DataHelper;
            }
        }

        public IValidationHelper ValidationHelper
        {
            get
            {
                return ServiceHelper.ValidationHelper;
            }
        }

        public BaseDomainService DataService
        {
            get;
        }

        #region Private Fields

        private Lazy<dynamic> _dataBag = new Lazy<dynamic>(() => new ExpandoObject(), true);

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