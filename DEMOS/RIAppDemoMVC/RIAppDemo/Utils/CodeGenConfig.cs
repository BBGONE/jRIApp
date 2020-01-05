using RIAPP.DataService.Core.CodeGen;

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