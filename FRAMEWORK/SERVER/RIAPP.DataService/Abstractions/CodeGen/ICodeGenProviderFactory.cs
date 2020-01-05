namespace RIAPP.DataService.Core.CodeGen
{
    public interface ICodeGenProviderFactory
    {
        ICodeGenProvider Create(BaseDomainService owner);

        string Lang
        {
            get;
        }
    }

    public interface ICodeGenProviderFactory<TService> : ICodeGenProviderFactory
        where TService : BaseDomainService
    {
        ICodeGenProvider<TService> Create(TService owner);
    }
}