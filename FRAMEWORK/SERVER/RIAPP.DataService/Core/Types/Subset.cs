using System.Collections.Generic;

namespace RIAPP.DataService.Core.Types
{

    public class Subset
    {
        /// <summary>
        ///     field names
        /// </summary>

        public IEnumerable<FieldName> names { get; set; }


        public IEnumerable<Row> rows { get; set; }



        public string dbSetName { get; set; }
    }
}