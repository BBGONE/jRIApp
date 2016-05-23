using System;
using System.Runtime.Serialization;
using RIAPP.DataService.Utils;

namespace RIAPP.DataService.DomainService.Types
{
    [DataContract]
    public class MetadataResult
    {
        public MetadataResult()
        {
            serverTimezone = DataHelper.GetLocalDateTimezoneOffset(DateTime.Now);
        }

        [DataMember]
        public DBSetList dbSets { get; set; } = new DBSetList();

        [DataMember]
        public AssocList associations { get; set; } = new AssocList();

        [DataMember]
        public MethodsList methods { get; set; } = new MethodsList();

        [DataMember]
        public int serverTimezone { get; set; }
    }
}