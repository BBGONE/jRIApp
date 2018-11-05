using RIAPP.DataService.DomainService.Interfaces;
using RIAPP.DataService.Utils;
using System.Collections.Generic;
using System.ComponentModel;
using System.Runtime.Serialization;
using System.Threading.Tasks;

namespace RIAPP.DataService.DomainService.Types
{
    [DataContract]
    public class MethodDescription
    {
        public MethodDescription(MethodInfoData data)
        {
            methodData = data;
            parameters = new List<ParamMetadata>();
        }

        [DataMember]
        public string methodName
        {
            get { return methodData.methodInfo.Name; }
        }

        [DataMember]
        public List<ParamMetadata> parameters { get; set; }

        [DataMember]
        [Description("Is it returns or not result from method's invocation")]
        public bool methodResult
        {
            get
            {
                var returnType = methodData.methodInfo.ReturnType;
                var isVoid = returnType == typeof(void) || returnType == typeof(Task);
                return !isVoid;
            }
        }

        [DataMember]
        [Description("Is it a Query method")]
        public bool isQuery
        {
            get { return methodData.methodType == MethodType.Query; }
        }


        [IgnoreDataMember]
        public MethodInfoData methodData { get; }

        /// <summary>
        ///     Generates Data Services' method description which is convertable to JSON
        ///     and can be consumed by clients
        /// </summary>
        public static MethodDescription FromMethodInfo(MethodInfoData data, IServiceContainer container)
        {
            var methDescription = new MethodDescription(data);
            //else Result is Converted to JSON
            var paramsInfo = data.methodInfo.GetParameters();
            for (var i = 0; i < paramsInfo.Length; ++i)
            {
                var param = ParamMetadata.FromParamInfo(paramsInfo[i], container);
                param.ordinal = i;
                methDescription.parameters.Add(param);
            }
            return methDescription;
        }
    }
}