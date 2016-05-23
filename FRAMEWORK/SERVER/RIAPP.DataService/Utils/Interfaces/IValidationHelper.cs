using RIAPP.DataService.DomainService.Types;

namespace RIAPP.DataService.Utils.Interfaces
{
    public interface IValidationHelper
    {
        void CheckRange(Field fieldInfo, string val);
        void CheckString(Field fieldInfo, string val);
        void CheckValue(Field fieldInfo, string val);
    }
}