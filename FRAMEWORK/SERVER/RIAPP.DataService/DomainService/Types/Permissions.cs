using System;
using System.Runtime.Serialization;
using RIAPP.DataService.Utils;

namespace RIAPP.DataService.DomainService.Types
{
    [DataContract]
    public class Permissions
    {
        public Permissions()
        {
            serverTimezone = DateTimeHelper.GetTimezoneOffset();
        }

        [DataMember]
        public PermissionList permissions { get; set; } = new PermissionList();


        [DataMember]
        public int serverTimezone { get; set; }
    }
}