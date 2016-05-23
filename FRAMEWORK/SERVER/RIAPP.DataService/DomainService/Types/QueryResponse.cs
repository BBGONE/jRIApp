using System.Collections.Generic;
using System.Runtime.Serialization;

namespace RIAPP.DataService.DomainService.Types
{
    [DataContract]
    public class QueryResponse
    {
        /// <summary>
        ///     field names returned in the rows
        /// </summary>
        [DataMember]
        public IEnumerable<FieldName> names { get; set; }

        [DataMember]
        public IEnumerable<Row> rows { get; set; }

        [DataMember]
        public int? pageIndex { get; set; }

        [DataMember]
        public int? pageCount { get; set; }

        [DataMember]
        public string dbSetName { get; set; }

        /// <summary>
        ///     Client can ask to return rows totalcount (in paging scenarios)
        /// </summary>
        [DataMember]
        public int? totalCount { get; set; }

        [DataMember]
        public object extraInfo { get; set; }

        /// <summary>
        ///     Client must first check this field
        ///     if all ok, then error is empty
        ///     otherwise it contains error message
        /// </summary>
        [DataMember]
        public ErrorInfo error { get; set; }


        /// <summary>
        ///     related child entities (from navigation properties) included in the main result
        /// </summary>
        [DataMember]
        public IEnumerable<Subset> subsets { get; set; }
    }
}