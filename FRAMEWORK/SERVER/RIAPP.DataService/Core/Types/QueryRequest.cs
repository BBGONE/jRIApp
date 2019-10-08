using System.Runtime.Serialization;

namespace RIAPP.DataService.Core.Types
{
    [DataContract]
    public class QueryRequest: IUseCaseRequest<QueryResponse>
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

        internal DbSetInfo _dbSetInfo { get; set; }
    }
}