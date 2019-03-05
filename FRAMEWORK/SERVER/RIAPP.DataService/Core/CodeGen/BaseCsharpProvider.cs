namespace RIAPP.DataService.Core.CodeGen
{
    public abstract class BaseCsharpProvider<TService> : ICodeGenProvider<TService>
         where TService : BaseDomainService
    {
        public BaseCsharpProvider(TService owner, string lang)
        {
            this.Owner = owner;
            this.Lang = lang;
        }

        public string Lang
        {
            get;
        }

        public TService Owner { get; }

        public abstract string GenerateScript(string comment = null, bool isDraft = false);
    }
}
