using RIAPP.DataService.DomainService.Exceptions;
using RIAPP.DataService.DomainService.Metadata;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Runtime.Serialization;

namespace RIAPP.DataService.DomainService.Types
{
    /// <summary>
    ///  Stores parameter description (it's attributes)
    /// </summary>
    [DataContract]
    public class MethodParameter
    {
        public MethodParameter()
        {
            name = "";
            value = null;
        }

        [DataMember]
        [Description("Parameter name")]
        public string name { get; set; }


        [DataMember]
        [Description("Parameter value as string")]
        public string value { get; set; }
    }

    [DataContract]
    public class MethodParameters
    {
        public MethodParameters()
        {
            parameters = new List<MethodParameter>();
        }

        [DataMember]
        public List<MethodParameter> parameters { get; set; }

        public object GetValue(string name, MethodDescription methodDescription, IServiceContainer serviceContainer)
        {
            var par = parameters.Where(p => p.name == name).FirstOrDefault();
            if (par == null)
                return null;
            var paraminfo = methodDescription.parameters.Where(p => p.name == name).FirstOrDefault();
            if (paraminfo == null)
            {
                throw new DomainServiceException(string.Format("Method: {0} has no parameter with a name: {1}",
                    methodDescription.methodName, name));
            }
            return serviceContainer.GetDataHelper().ParseParameter(paraminfo.ParameterType, paraminfo, paraminfo.isArray,
                par.value);
        }
    }
}