using System.Runtime.Serialization;

namespace RIAPP.DataService.DomainService.Types
{
    [DataContract]
    public class ValueChange
    {
        public ValueChange()
        {
            val = null;
            orig = null;
            flags = ValueFlags.None;
            fieldName = string.Empty;
        }

        [DataMember]
        public string val { get; set; }

        [DataMember]
        public string orig { get; set; }


        [DataMember]
        public string fieldName { get; set; }

        [DataMember]
        public ValueFlags flags { get; set; }

        /// <summary>
        ///     Nested values used for object field
        /// </summary>
        [DataMember]
        public ValuesList nested { get; set; }
    }
}