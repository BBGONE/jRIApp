using RIAPP.DataService.Core.Types;
using RIAPP.DataService.Utils;

namespace RIAPP.DataService.Core.Metadata
{

    public class MetadataResult
    {
        public MetadataResult()
        {
            serverTimezone = DateTimeHelper.GetTimezoneOffset();
        }


        public DBSetList dbSets { get; set; } = new DBSetList();


        public AssocList associations { get; set; } = new AssocList();


        public MethodsList methods { get; set; } = new MethodsList();


        public int serverTimezone { get; set; }
    }
}