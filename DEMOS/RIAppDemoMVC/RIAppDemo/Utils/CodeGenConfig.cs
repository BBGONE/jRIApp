using RIAPP.DataService.DomainService.CodeGen;

namespace RIAppDemo.Utils
{
    public class CodeGenConfig : ICodeGenConfig
    {
        public CodeGenConfig()
        {
            
        }

        bool ICodeGenConfig.IsCodeGenEnabled => true;
    }
}