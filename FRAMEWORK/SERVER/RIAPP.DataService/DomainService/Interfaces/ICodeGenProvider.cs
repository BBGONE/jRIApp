using RIAPP.DataService.DomainService.Types;

namespace RIAPP.DataService.DomainService.Interfaces
{
    public interface ICodeGenProvider
    {
        string GetScript(string comment, bool isDraft);

        string lang
        {
            get;
        }
    }
}
