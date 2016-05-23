using System.Collections.Generic;
using System.Runtime.Serialization;

namespace RIAPP.DataService.DomainService.Types
{
    [DataContract]
    public class Subset
    {
        /// <summary>
        ///     field names
        /// </summary>
        [DataMember]
        public IEnumerable<FieldName> names { get; set; }

        [DataMember]
        public IEnumerable<Row> rows { get; set; }


        [DataMember]
        public string dbSetName { get; set; }
    }
}