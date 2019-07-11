using System.Runtime.Serialization;

namespace RIAPP.DataService.Core.Types
{
    [DataContract]
    public class RefreshInfo: IUseCaseRequest<RefreshInfo>
    {
        [DataMember]
        public string dbSetName { get; set; }

        [DataMember]
        public RowInfo rowInfo { get; set; }

        [DataMember]
        public ErrorInfo error { get; set; }

        [IgnoreDataMember]
        public DbSetInfo dbSetInfo { get; set; }
    }
}