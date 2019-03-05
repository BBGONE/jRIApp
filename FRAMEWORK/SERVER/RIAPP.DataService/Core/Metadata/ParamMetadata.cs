using RIAPP.DataService.Annotations.Metadata;
using RIAPP.DataService.Core.Exceptions;
using RIAPP.DataService.Core.Types;
using System;
using System.ComponentModel;
using System.Linq;
using System.Reflection;
using System.Runtime.Serialization;

namespace RIAPP.DataService.Core.Metadata
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
            paramInfo.isNullable = container.GetValueConverter().IsNullableType(ptype);
            paramInfo.name = pinfo.Name;
            paramInfo.ParameterType = ptype;
            Type realType = paramInfo.isNullable ? Nullable.GetUnderlyingType(ptype) : ptype;

            var dateConvert = (IDateConversionData)pinfo.GetCustomAttributes(false).FirstOrDefault(a => a is IDateConversionData);
            if (dateConvert != null)
            {
                paramInfo.dateConversion = dateConvert.DateConversion;
            }

            bool isArray = false;
            try
            {
                paramInfo.dataType = container.GetValueConverter().DataTypeFromType(realType, out isArray);
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