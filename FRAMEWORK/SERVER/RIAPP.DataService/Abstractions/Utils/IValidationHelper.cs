using RIAPP.DataService.Core;
using RIAPP.DataService.Core.Types;

namespace RIAPP.DataService.Utils
{
    public interface IValidationHelper
    {
        void CheckRange(Field fieldInfo, string val);
        void CheckString(Field fieldInfo, string val);
        void CheckValue(Field fieldInfo, string val);
    }

    public interface IValidationHelper<TService> : IValidationHelper
         where TService : BaseDomainService
    {

    }
}