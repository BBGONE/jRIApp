using RIAPP.DataService.DomainService;

namespace RIAPP.DataService.DomainService.CodeGen
{
    public interface ICodeGenProviderFactory
    {
        ICodeGenProvider Create(BaseDomainService owner);

        string Lang
        {
            get;
        }
    }

    public interface ICodeGenProviderFactory<TService>: ICodeGenProviderFactory
        where TService : BaseDomainService
    {
        ICodeGenProvider<TService> Create(TService owner);
    }
}