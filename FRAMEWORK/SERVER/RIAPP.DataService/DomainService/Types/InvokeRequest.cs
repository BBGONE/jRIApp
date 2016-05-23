using System.Runtime.Serialization;

namespace RIAPP.DataService.DomainService.Types
{
    [DataContract]
    public class InvokeRequest
    {
        [DataMember]
        public string methodName { get; set; }

        [DataMember]
        public MethodParameters paramInfo { get; set; } = new MethodParameters();
    }
}