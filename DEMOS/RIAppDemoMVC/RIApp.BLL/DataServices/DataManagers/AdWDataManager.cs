using RIAPP.DataService.DomainService;
using RIAPP.DataService.DomainService.Types;
using RIAPP.DataService.Utils.Extensions;
using RIAppDemo.DAL.EF;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace RIAppDemo.BLL.DataServices.DataManagers
{
    public class AdWDataManager<TModel> : BaseDataManager<RIAppDemoServiceEF, TModel>
        where TModel : class
    {
        protected const string USERS_ROLE = RIAppDemoServiceEF.USERS_ROLE;
        protected const string ADMINS_ROLE = RIAppDemoServiceEF.ADMINS_ROLE;

        protected ADWDbContext DB
        {
            get { return DataService.DB; }
        }

        protected PerformQueryResult<TModel> PerformQuery(Func<IQueryable<TModel>, Task<int>> totalCountFunc)
        {
            var dbset = DB.Set<TModel>();
            return this.PerformQuery(dbset.AsNoTracking(), totalCountFunc);
        }

        protected PerformQueryResult<TEntity> PerformQuery<TEntity>(Func<IQueryable<TEntity>, Task<int>> totalCountFunc)
            where TEntity : class
        {
            var dbset = DB.Set<TEntity>();
            return this.PerformQuery(dbset.AsNoTracking(), totalCountFunc);
        }
    }
}