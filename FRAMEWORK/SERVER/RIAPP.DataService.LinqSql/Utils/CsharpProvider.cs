using RIAPP.DataService.Utils.CodeGen;

namespace RIAPP.DataService.LinqSql.Utils
{
    public class CsharpProvider<TDB> : BaseCsharpProvider
         where TDB : System.Data.Linq.DataContext
    {
        private TDB _db;

        public CsharpProvider(LinqForSqlDomainService<TDB> owner) : base(owner)
        {
            this._db = owner.DB;
        }

        public override string GetScript(string comment = null, bool isDraft = false)
        {
            this.CheckCodeGen();
            var metadata = this._owner.ServiceGetMetadata();
            return DataServiceMethodsHelper.CreateMethods(metadata, this._db);
        }
    }
}
