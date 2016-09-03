using RIAPP.DataService.Utils.CodeGen;
using System.Data.Entity;

namespace RIAPP.DataService.EF6_CF.Utils
{
    public class CsharpProvider<TDB> : BaseCsharpProvider
         where TDB : DbContext
    {
        private TDB _db;

        public CsharpProvider(EFDomainService<TDB> owner) : base(owner)
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
