using RIAPP.DataService.Core;

namespace RIAPP.DataService.Core.CodeGen
{
    public interface ICodeGenProvider
    {
        string GenerateScript(string comment, bool isDraft);

        string Lang
        {
            get;
        }
    }

    public interface ICodeGenProvider<TService> : ICodeGenProvider
            where TService : BaseDomainService
    {
         TService Owner { get; }
    }
}
