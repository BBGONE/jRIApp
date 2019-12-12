using RIAPP.DataService.Core.Types;
using System;
using System.Threading.Tasks;

namespace RIAPP.DataService.Core
{
    public class BaseDataManager<TDataService, TModel> : IDataManager<TModel>, IDataServiceComponent
        where TModel : class
        where TDataService : BaseDomainService
    {
        BaseDomainService IDataServiceComponent.DataService
        {
            get
            {
                return this.DataService;
            }
        }

        public TDataService DataService
        {
            get { return (TDataService)RequestContext.DataService; }
        }

        protected RequestContext RequestContext
        {
            get { return RequestContext.Current; }
        }

        protected QueryRequest CurrentQueryInfo
        {
            get { return RequestContext.CurrentQueryInfo; }
        }

        public virtual void Insert(TModel model)
        {
            throw new NotImplementedException();
        }

        public virtual void Update(TModel model)
        {
            throw new NotImplementedException();
        }

        public virtual void Delete(TModel model)
        {
            throw new NotImplementedException();
        }

        public virtual Task AfterExecuteChangeSet(ChangeSetRequest changeSet)
        {
            return Task.CompletedTask;
        }

        public virtual Task AfterChangeSetCommited(ChangeSetRequest changeSet, SubResultList refreshResult)
        {
            return Task.CompletedTask;
        }

        public IServiceContainer ServiceContainer
        {
            get { return DataService.ServiceContainer; }
        }


        public object GetParent(Type entityType)
        {
            return RequestContext.GetParent(entityType);
        }

        public TModel GetOriginal()
        {
            return RequestContext.GetOriginal<TModel>();
        }

        public TModel2 GetParent<TModel2>()
            where TModel2 : class
        {
            return RequestContext.GetParent<TModel2>();
        }
    }
}