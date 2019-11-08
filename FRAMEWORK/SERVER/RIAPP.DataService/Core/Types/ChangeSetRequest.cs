using System.Runtime.Serialization;

namespace RIAPP.DataService.Core.Types
{

    [DataContract]
    public class ChangeSetRequest: IUseCaseRequest<ChangeSetResponse>
    {
        public ChangeSetRequest()
        {
            dbSets = new DbSetList();
            trackAssocs = new TrackAssocList();
        }

        [DataMember]
        public DbSetList dbSets { get; set; }

        [DataMember]
        public TrackAssocList trackAssocs { get; set; }
    }
}