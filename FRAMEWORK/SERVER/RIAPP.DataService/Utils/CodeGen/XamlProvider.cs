using RIAPP.DataService.DomainService.Interfaces;
using RIAPP.DataService.DomainService;
using System;
using RIAPP.DataService.Resources;
using System.Reflection;
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
            if (!this._owner.IsCodeGenEnabled)
                throw new InvalidOperationException(ErrorStrings.ERR_CODEGEN_DISABLED);

            Metadata metadata = null;
            MetadataHelper.ExecuteOnSTA(state => { metadata = this._owner.GetMetadata(isDraft); }, this);
            return metadata.ToXML();
        }
    }
}
