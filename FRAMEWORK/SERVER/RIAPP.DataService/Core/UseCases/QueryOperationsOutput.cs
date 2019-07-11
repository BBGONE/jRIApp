using RIAPP.DataService.Core.Types;

namespace RIAPP.DataService.Core
{
    public class QueryOperationsOutput : IOutputPort<QueryResponse>
    {
        public QueryResponse Response
        {
            get;
            private set;
        }


        public QueryOperationsOutput()
        {
           
        }

        public void Handle(QueryResponse response)
        {
            this.Response = response;
        }
    }
}
