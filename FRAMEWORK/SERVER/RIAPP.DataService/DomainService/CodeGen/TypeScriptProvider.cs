using RIAPP.DataService.DomainService.Metadata;
using System;
using System.Collections.Generic;
using System.Linq;

namespace RIAPP.DataService.DomainService.CodeGen
{

    public class TypeScriptProvider<TService> : ICodeGenProvider<TService>
         where TService : BaseDomainService
    {
        private readonly Func<IEnumerable<Type>> _clientTypes;

        public TypeScriptProvider(TService owner, string lang, Func<IEnumerable<Type>> clientTypes)
        {
            this.Owner = owner;
            this.Lang = lang;
            this._clientTypes = clientTypes ?? (() => Enumerable.Empty<Type>());
        }

        public string Lang
        {
            get;
        }

        public TService Owner { get; }

        public virtual string GenerateScript(string comment = null, bool isDraft = false)
        {
            RunTimeMetadata metadata = this.Owner.GetMetadata();
            var helper = new TypeScriptHelper(this.Owner.ServiceContainer, metadata, this._clientTypes());
            return helper.CreateTypeScript(comment);
        }
    }

    public class TypeScriptProviderFactory<TService> : ICodeGenProviderFactory<TService>
         where TService : BaseDomainService
    {
        private readonly Func<IEnumerable<Type>> _clientTypes;

        public TypeScriptProviderFactory(Func<IEnumerable<Type>> clientTypes = null)
        {
            this._clientTypes = clientTypes;
        }

        public ICodeGenProvider Create(BaseDomainService owner)
        {
            return this.Create((TService)owner);
        }

        public ICodeGenProvider<TService> Create(TService owner)
        {
            return new TypeScriptProvider<TService>(owner, this.Lang, this._clientTypes);
        }

        public string Lang
        {
            get
            {
                return "ts";
            }
        }
    }
}
