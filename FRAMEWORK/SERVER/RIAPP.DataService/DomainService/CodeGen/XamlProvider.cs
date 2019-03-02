using RIAPP.DataService.DomainService.Metadata;

namespace RIAPP.DataService.DomainService.CodeGen
{

    public class XamlProvider<TService> : ICodeGenProvider<TService>
         where TService : BaseDomainService
    {
        public XamlProvider(TService owner, string lang)
        {
            this.Owner = owner;
            this.Lang = lang;
        }


        public string Lang
        {
            get;
        }

        public TService Owner { get; }

        public virtual string GenerateScript(string comment = null, bool isDraft = false)
        {
            DesignTimeMetadata metadata = this.Owner.GetDesignTimeMetadata(isDraft);
            return metadata.ToXML();
        }
    }

    public class XamlProviderFactory<TService> : ICodeGenProviderFactory<TService>
         where TService : BaseDomainService
    {
        public ICodeGenProvider Create(BaseDomainService owner)
        {
            return this.Create((TService)owner);
        }

        public ICodeGenProvider<TService> Create(TService owner)
        {
            return new XamlProvider<TService>(owner, this.Lang);
        }

        public string Lang
        {
            get
            {
                return "xaml";
            }
        }
    }
}
