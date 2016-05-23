using System.Collections;

namespace RIAPP.DataService.DomainService.Types
{
    public class SubResult
    {
        public string dbSetName { get; set; }

        public IEnumerable Result { get; set; }
    }
}