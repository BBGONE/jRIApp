using System.Collections.Generic;

namespace RIAPP.DataService.DomainService.Types
{
    public class SubResult
    {
        public string dbSetName { get; set; }

        public IEnumerable<object> Result { get; set; }
    }
}