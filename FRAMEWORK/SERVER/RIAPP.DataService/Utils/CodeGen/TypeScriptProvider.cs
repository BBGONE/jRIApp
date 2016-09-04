using RIAPP.DataService.DomainService;
using RIAPP.DataService.DomainService.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;

namespace RIAPP.DataService.Utils.CodeGen
{
    public class TypeScriptProvider : ICodeGenProvider
    {
        private BaseDomainService _owner;
        private IEnumerable<Type> _clientTypes;

        public TypeScriptProvider(BaseDomainService owner, IEnumerable<Type> clientTypes)
        {
            this._owner = owner;
            this._clientTypes = clientTypes ?? Enumerable.Empty<Type>();
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
            var metadata = this._owner.ServiceGetMetadata();
            var helper = new TypeScriptHelper(this._owner.ServiceContainer, metadata, this._clientTypes);
            return helper.CreateTypeScript(comment);
        }
    }
}
