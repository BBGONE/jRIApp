using System.Runtime.Serialization;

namespace RIAPP.DataService.DomainService.Types
{
    [DataContract]
    public class Value
    {
        public Value()
        {
            val = null;
            ord = -1;
        }

        [DataMember]
        public string val { get; set; }


        [DataMember]
        public int ord { get; set; }
    }
}