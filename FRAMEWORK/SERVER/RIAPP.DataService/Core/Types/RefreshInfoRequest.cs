using System.Runtime.Serialization;

namespace RIAPP.DataService.Core.Types
{
    [DataContract]
    public class RefreshInfoRequest: IUseCaseRequest<RefreshInfoResponse>
    {
        [DataMember]
        public string dbSetName { get; set; }

        [DataMember]
        public RowInfo rowInfo { get; set; }

        internal DbSetInfo _dbSetInfo { get; set; }
    }
}