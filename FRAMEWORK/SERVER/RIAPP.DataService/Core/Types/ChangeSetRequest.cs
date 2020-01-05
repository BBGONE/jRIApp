namespace RIAPP.DataService.Core.Types
{


    public class ChangeSetRequest : IUseCaseRequest<ChangeSetResponse>
    {
        public ChangeSetRequest()
        {
            dbSets = new DbSetList();
            trackAssocs = new TrackAssocList();
        }


        public DbSetList dbSets { get; set; }


        public TrackAssocList trackAssocs { get; set; }
    }
}