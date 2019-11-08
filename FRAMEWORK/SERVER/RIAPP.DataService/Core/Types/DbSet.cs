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
}
