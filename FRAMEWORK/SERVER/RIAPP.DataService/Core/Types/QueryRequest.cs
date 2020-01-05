namespace RIAPP.DataService.Core.Types
{

    public class QueryRequest : IUseCaseRequest<QueryResponse>
    {

        public string dbSetName { get; set; }


        public string queryName { get; set; }


        public FilterInfo filterInfo { get; set; } = new FilterInfo();


        public SortInfo sortInfo { get; set; } = new SortInfo();


        public MethodParameters paramInfo { get; set; } = new MethodParameters();


        public int pageIndex { get; set; }


        public int pageSize { get; set; }


        public int pageCount { get; set; }



        public bool isIncludeTotalCount { get; set; }

        internal DbSetInfo _dbSetInfo { get; set; }
    }
}