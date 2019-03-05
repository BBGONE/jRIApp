using System.Runtime.Serialization;

namespace RIAPP.DataService.Core.Types
{
    [DataContract]
    public class DbSetPermit
    {
        [DataMember]
        public string dbSetName { get; set; }

        [DataMember]
        public bool canAddRow { get; set; }

        [DataMember]
        public bool canEditRow { get; set; }

        [DataMember]
        public bool canDeleteRow { get; set; }

        [DataMember]
        public bool canRefreshRow { get; set; }
    }
}