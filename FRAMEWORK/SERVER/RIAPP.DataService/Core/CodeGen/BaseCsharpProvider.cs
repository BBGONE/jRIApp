using RIAPP.DataService.Core.Metadata;

namespace RIAPP.DataService.Core.CodeGen
{
    public abstract class BaseCsharpProvider<TService> : ICodeGenProvider<TService>
         where TService : BaseDomainService
    {
        public BaseCsharpProvider(IMetaDataProvider owner, string lang)
        {
            this.Owner = owner;
            this.Lang = lang;
        }

        public string Lang
        {
            get;
        }

        public IMetaDataProvider Owner { get; }

        public abstract string GenerateScript(string comment = null, bool isDraft = false);
    }
}
