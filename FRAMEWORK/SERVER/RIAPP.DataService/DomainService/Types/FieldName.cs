using System.Runtime.Serialization;

namespace RIAPP.DataService.DomainService.Types
{
    [DataContract]
    public class FieldName
    {
        /// <summary>
        ///     Field name
        /// </summary>
        [DataMember]
        public string n { get; set; }


        /// <summary>
        ///     For object field it contains property names (nested fields)
        /// </summary>
        [DataMember]
        public FieldName[] p { get; set; }
    }
}