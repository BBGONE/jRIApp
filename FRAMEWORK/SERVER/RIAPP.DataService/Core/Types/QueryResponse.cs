using System.Collections.Generic;

namespace RIAPP.DataService.Core.Types
{

    public class QueryResponse
    {
        /// <summary>
        ///     field names returned in the rows
        /// </summary>

        public IEnumerable<FieldName> names { get; set; }


        public IEnumerable<Row> rows { get; set; }


        public int? pageIndex { get; set; }


        public int? pageCount { get; set; }


        public string dbSetName { get; set; }

        /// <summary>
        ///     Client can ask to return rows totalcount (in paging scenarios)
        /// </summary>

        public int? totalCount { get; set; }


        public object extraInfo { get; set; }

        /// <summary>
        ///     Client must first check this field
        ///     if all ok, then error is empty
        ///     otherwise it contains error message
        /// </summary>

        public ErrorInfo error { get; set; }


        /// <summary>
        ///     related child entities (from navigation properties) included in the main result
        /// </summary>

        public IEnumerable<Subset> subsets { get; set; }
    }
}