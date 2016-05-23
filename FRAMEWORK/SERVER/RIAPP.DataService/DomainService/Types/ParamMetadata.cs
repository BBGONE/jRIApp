using System;
using System.ComponentModel;
using System.Reflection;
using System.Runtime.Serialization;
using System.Web.Script.Serialization;
using RIAPP.DataService.DomainService.Attributes;
using RIAPP.DataService.DomainService.Exceptions;
using RIAPP.DataService.DomainService.Interfaces;

namespace RIAPP.DataService.DomainService.Types
{
    /// <summary>
    ///     Stores information about parameter
    ///     used to check values recieved from client
    ///     before service method invocations
    /// </summary>
    [DataContract]
    public class ParamMetadata
    {
        public ParamMetadata()
        {
            name = "";
            dataType = DataType.None;
            ordinal = -1;
            isNullable = false;
            isArray = false;
            dateConversion = DateConversion.None;
        }

        [DataMember]
        [Description("Parameter name")]
        public string name { get; set; }

        [DataMember]
        [Description("Parameter type")]
        public DataType dataType { get; set; }

        [DataMember]
        [Description("True if parameter is array")]
        public bool isArray { get; set; }

        [DataMember]
        [Description("Parameter position")]
        public bool isNullable { get; set; }

        [DataMember]
        [Description("How adjust date timezone between server and client")]
        public DateConversion dateConversion { get; set; }

        [DataMember]
        [Description("Parameter position")]
        public int ordinal { get; set; }

        [IgnoreDataMember]
        [ScriptIgnore]
        public Type ParameterType { get; set; }


        /// <summary>
        ///     Extracts from ParameterInfo all information about method parameter
        /// </summary>
        /// <returns>ParamMetadataInfo</returns>
        public static ParamMetadata FromParamInfo(ParameterInfo pinfo, IServiceContainer container)
        {
            var ptype = pinfo.ParameterType;
            if (pinfo.IsOut)
                throw new DomainServiceException("Out parameters are not supported in service methods");
            var paramInfo = new ParamMetadata();
            paramInfo.isNullable = container.ValueConverter.IsNullableType(ptype);
            paramInfo.name = pinfo.Name;
            paramInfo.ParameterType = ptype;
            Type realType = null;
            if (!paramInfo.isNullable)
                realType = ptype;
            else
                realType = Nullable.GetUnderlyingType(ptype);
            var dtops = pinfo.GetCustomAttributes(typeof(DateOptionAttribute), false);
            if (dtops.Length > 0)
            {
                paramInfo.dateConversion = (dtops[0] as DateOptionAttribute).dateConversion;
            }
            var isArray = false;
            try
            {
                paramInfo.dataType = container.ValueConverter.DataTypeFromType(realType, out isArray);
            }
            catch (UnsupportedTypeException)
            {
                paramInfo.dataType = DataType.None;
            }
            paramInfo.isArray = isArray;
            return paramInfo;
        }
    }
}