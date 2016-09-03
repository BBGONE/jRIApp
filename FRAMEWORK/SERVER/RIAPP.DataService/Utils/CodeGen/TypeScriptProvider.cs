using RIAPP.DataService.DomainService.Interfaces;
using RIAPP.DataService.DomainService;
using System;
using RIAPP.DataService.Resources;
using System.Reflection;

namespace RIAPP.DataService.Utils.CodeGen
{
    public class TypeScriptProvider : ICodeGenProvider
    {
        private BaseDomainService _owner;
        public TypeScriptProvider(BaseDomainService owner)
        {
            this._owner = owner;
        }

        public string lang
        {
            get
            {
                return "ts";
            }
        }

        public virtual string GetScript(string comment = null, bool isDraft = false)
        {
            if (!this._owner.IsCodeGenEnabled)
                throw new InvalidOperationException(ErrorStrings.ERR_CODEGEN_DISABLED);

            var metadata = this._owner.ServiceGetMetadata();
            var helper = new TypeScriptHelper(this._owner.ServiceContainer, metadata,  this._owner.GetClientTypes());
            return helper.CreateTypeScript(comment);
        }
    }
}
