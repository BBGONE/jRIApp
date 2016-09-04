using RIAPP.DataService.Utils.CodeGen;

namespace RIAPP.DataService.EF.Utils
{
    public class CsharpProvider<TDB> : BaseCsharpProvider
         where TDB : System.Data.Objects.ObjectContext
    {
        private TDB _db;

        public CsharpProvider(EFDomainService<TDB> owner) : base(owner)
        {
            this._db = owner.DB;
        }

        public override string GetScript(string comment = null, bool isDraft = false)
        {
            var metadata = this._owner.ServiceGetMetadata();
            return DataServiceMethodsHelper.CreateMethods(metadata, this._db);
        }
    }
}
