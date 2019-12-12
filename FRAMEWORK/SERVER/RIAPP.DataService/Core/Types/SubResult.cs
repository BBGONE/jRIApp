using System.Collections.Generic;

namespace RIAPP.DataService.Core.Types
{
    public class SubResult
    {
        public string dbSetName { get; set; }

        public IEnumerable<object> Result { get; set; }
    }
}