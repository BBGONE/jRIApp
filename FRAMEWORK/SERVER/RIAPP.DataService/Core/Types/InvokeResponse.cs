using System.Runtime.Serialization;

namespace RIAPP.DataService.Core.Types
{
    [DataContract]
    public class InvokeResponse
    {
        [DataMember]
        public object result { get; set; }

        /// <summary>
        ///     Client must first check this field
        ///     if all ok, then error is empty
        ///     otherwise it contains error message
        /// </summary>
        [DataMember]
        public ErrorInfo error { get; set; }
    }
}