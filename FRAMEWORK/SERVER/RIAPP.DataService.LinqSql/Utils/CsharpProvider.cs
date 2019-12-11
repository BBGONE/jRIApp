using RIAPP.DataService.Core;
using RIAPP.DataService.Core.CodeGen;

namespace RIAPP.DataService.LinqSql.Utils
{
    public class CsharpProvider<TService, TDB> : BaseCsharpProvider<TService>
       where TService : LinqForSqlDomainService<TDB>
       where TDB : System.Data.Linq.DataContext
    {
        private readonly TDB _db;

        public CsharpProvider(TService owner, string lang) :
            base(owner, lang)
        {
            this._db = owner.DB;
        }


        public override string GenerateScript(string comment = null, bool isDraft = false)
        {
            var metadata = this.Owner.GetMetadata();
            return DataServiceMethodsHelper.CreateMethods(metadata, this._db);
        }
    }

    public class CsharpProviderFactory<TService, TDB> : ICodeGenProviderFactory<TService>
        where TService : LinqForSqlDomainService<TDB>
        where TDB : System.Data.Linq.DataContext
    {
        public ICodeGenProvider Create(BaseDomainService owner)
        {
            return this.Create((TService)owner);
        }

        public ICodeGenProvider<TService> Create(TService owner)
        {
            return new CsharpProvider<TService, TDB>(owner, this.Lang);
        }

        public string Lang
        {
            get
            {
                return "csharp";
            }
        }
    }
 
}
