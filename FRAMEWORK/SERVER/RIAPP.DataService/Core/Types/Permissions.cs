using RIAPP.DataService.Utils;

namespace RIAPP.DataService.Core.Types
{

    public class Permissions
    {
        public Permissions()
        {
            serverTimezone = DateTimeHelper.GetTimezoneOffset();
        }


        public PermissionList permissions { get; set; } = new PermissionList();



        public int serverTimezone { get; set; }
    }
}