using RIAPP.DataService.Core.Types;
using RIAPP.DataService.Utils;
using System.Runtime.Serialization;

namespace RIAPP.DataService.Core.Metadata
{
    [DataContract]
    public class MetadataResult
    {
        public MetadataResult()
        {
            serverTimezone = DateTimeHelper.GetTimezoneOffset();
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