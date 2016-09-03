using RIAPP.DataService.DomainService;
using RIAPP.DataService.DomainService.Interfaces;
using RIAPP.DataService.Resources;
using System;

namespace RIAPP.DataService.Utils.CodeGen
{
    public abstract class BaseCsharpProvider : ICodeGenProvider
    {
        protected readonly BaseDomainService _owner;

        public BaseCsharpProvider(BaseDomainService owner)
        {
            this._owner = owner;
        }

        public string lang
        {
            get
            {
                return "csharp";
            }
        }

        protected void CheckCodeGen()
        {
            if (!this._owner.IsCodeGenEnabled)
                throw new InvalidOperationException(ErrorStrings.ERR_CODEGEN_DISABLED);
        }

        public abstract string GetScript(string comment = null, bool isDraft = false);
    }
}
