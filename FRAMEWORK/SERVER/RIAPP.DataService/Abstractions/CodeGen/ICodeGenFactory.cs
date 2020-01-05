namespace RIAPP.DataService.Core.CodeGen
{
    public interface ICodeGenFactory
    {
        bool IsCodeGenEnabled { get; }

        ICodeGenProvider GetCodeGen(BaseDomainService dataService, string lang);
    }

    public interface ICodeGenFactory<TService> : ICodeGenFactory
        where TService : BaseDomainService
    {
    }
}