using System.Linq;
using RIAppDemo.DAL.EF;
using RIAPP.DataService.DomainService;
using RIAPP.DataService.Utils.Extensions;

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

        protected IQueryable<TModel> PerformQuery(ref int? totalCount)
        {
            var dbset = DB.Set<TModel>();
            return this.PerformQuery(dbset.AsNoTracking(), ref totalCount);
        }

        protected IQueryable<TEntity> PerformQuery<TEntity>(ref int? totalCount)
            where TEntity : class
        {
            var dbset = DB.Set<TEntity>();
            return this.PerformQuery(dbset.AsNoTracking(), ref totalCount);
        }
    }
}