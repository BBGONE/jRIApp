using System.Runtime.Serialization;
using System.Web.Script.Serialization;

namespace RIAPP.DataService.DomainService.Types
{
    [DataContract]
    public class QueryRequest
    {
        [DataMember]
        public string dbSetName { get; set; }

        [DataMember]
        public string queryName { get; set; }

        [DataMember]
        public FilterInfo filterInfo { get; set; } = new FilterInfo();

        [DataMember]
        public SortInfo sortInfo { get; set; } = new SortInfo();

        [DataMember]
        public MethodParameters paramInfo { get; set; } = new MethodParameters();

        [DataMember]
        public int pageIndex { get; set; }

        [DataMember]
        public int pageSize { get; set; }

        [DataMember]
        public int pageCount { get; set; }


        [DataMember]
        public bool isIncludeTotalCount { get; set; }

        [ScriptIgnore]
        [IgnoreDataMember]
        public DbSetInfo dbSetInfo { get; set; }
    }
}