using RIAPP.DataService.DomainService.Interfaces;
using RIAPP.DataService.DomainService;
using RIAPP.DataService.DomainService.Types;

namespace RIAPP.DataService.Utils.CodeGen
{
    public class XamlProvider : ICodeGenProvider
    {
        private BaseDomainService _owner;
        public XamlProvider(BaseDomainService owner)
        {
            this._owner = owner;
        }

        public string lang
        {
            get
            {
                return "xaml";
            }
        }

        public virtual string GetScript(string comment = null, bool isDraft = false)
        {
            Metadata metadata = this._owner.GetMetadata(isDraft);
            return metadata.ToXML();
        }
    }
}
