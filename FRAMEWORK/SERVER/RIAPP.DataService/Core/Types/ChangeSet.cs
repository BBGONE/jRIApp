using System.Runtime.Serialization;

namespace RIAPP.DataService.Core.Types
{
    [DataContract]
    public class DbSet
    {
        public DbSet()
        {
            rows = new RowsList();
        }

        [DataMember]
        public string dbSetName { get; set; }

        [DataMember]
        public RowsList rows { get; set; }
    }

    [DataContract]
    public class ChangeSet: IUseCaseRequest<ChangeSet>
    {
        public ChangeSet()
        {
            dbSets = new DbSetList();
            trackAssocs = new TrackAssocList();
        }

        [DataMember]
        public DbSetList dbSets { get; set; }

        [DataMember]
        public ErrorInfo error { get; set; }

        [DataMember]
        public TrackAssocList trackAssocs { get; set; }
    }
}