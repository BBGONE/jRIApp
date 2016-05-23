using System.Runtime.Serialization;
using System.Web.Script.Serialization;

namespace RIAPP.DataService.DomainService.Types
{
    [DataContract]
    public class RefreshInfo
    {
        [DataMember]
        public string dbSetName { get; set; }

        [DataMember]
        public RowInfo rowInfo { get; set; }

        [DataMember]
        public ErrorInfo error { get; set; }

        [ScriptIgnore]
        [IgnoreDataMember]
        public DbSetInfo dbSetInfo { get; set; }
    }
}