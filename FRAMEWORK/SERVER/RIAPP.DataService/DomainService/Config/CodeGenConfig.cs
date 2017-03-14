using RIAPP.DataService.DomainService.Interfaces;
using RIAPP.DataService.Resources;
using RIAPP.DataService.Utils.CodeGen;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;

namespace RIAPP.DataService.DomainService.Config
{
    public class  CodeGenConfig
    {
        private BaseDomainService _dataService;
        private bool _IsCodeGenEnabled;
        private ConcurrentDictionary<string, Func<ICodeGenProvider>> _codeGenProviders;

        public CodeGenConfig(BaseDomainService dataService)
        {
            _dataService = dataService;
            clientTypes = new List<Type>();
            _codeGenProviders = new ConcurrentDictionary<string, Func<ICodeGenProvider>>();
            _IsCodeGenEnabled = false;
            this.AddOrReplaceCodeGen("xaml", () => new XamlProvider(_dataService));
            this.AddOrReplaceCodeGen("ts", () => new TypeScriptProvider(_dataService, this.clientTypes));
        }

        public List<Type> clientTypes
        {
            get;
        }

        public void AddOrReplaceCodeGen(string lang, Func<ICodeGenProvider> providerFactory)
        {
            this._codeGenProviders.AddOrUpdate(lang, providerFactory, (k, old) => { return providerFactory; });
        }

        public ICodeGenProvider GetCodeGen(string lang)
        {
            // ensure metadata initialized
            var metadata = _dataService.GetMetadata();
            Func<ICodeGenProvider> providerFactory = null;
            if (!this._codeGenProviders.TryGetValue(lang, out providerFactory))
                throw new InvalidOperationException(string.Format(ErrorStrings.ERR_CODEGEN_NOT_IMPLEMENTED, lang));

            return providerFactory();
        }

        public bool IsCodeGenEnabled { get { return _IsCodeGenEnabled; } set { _IsCodeGenEnabled = value; } }
    }
}