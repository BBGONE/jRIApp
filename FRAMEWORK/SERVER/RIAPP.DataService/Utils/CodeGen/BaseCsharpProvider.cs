using RIAPP.DataService.DomainService;
using RIAPP.DataService.DomainService.Interfaces;

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

        public abstract string GetScript(string comment = null, bool isDraft = false);
    }
}
