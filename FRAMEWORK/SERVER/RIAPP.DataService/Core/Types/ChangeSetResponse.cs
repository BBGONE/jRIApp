using System.Collections.Generic;

namespace RIAPP.DataService.Core.Types
{

    public class ChangeSetResponse
    {
        public ChangeSetResponse(ChangeSetRequest request)
        {
            dbSets = request.dbSets;
        }


        public DbSetList dbSets { get; set; }


        public ErrorInfo error { get; set; }


        public IEnumerable<Subset> subsets { get; set; }
    }
}