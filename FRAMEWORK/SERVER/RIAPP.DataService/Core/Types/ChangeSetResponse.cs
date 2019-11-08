using System.Runtime.Serialization;

namespace RIAPP.DataService.Core.Types
{
    [DataContract]
    public class ChangeSetResponse
    {
        public ChangeSetResponse(ChangeSetRequest request)
        {
            dbSets = request.dbSets;
        }

        [DataMember]
        public DbSetList dbSets { get; set; }

        [DataMember]
        public ErrorInfo error { get; set; }
    }
}