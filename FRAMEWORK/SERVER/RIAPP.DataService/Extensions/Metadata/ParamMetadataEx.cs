using System;

namespace RIAPP.DataService.Core.Metadata
{
    public static class ParamMetadataEx
    {
        public static Type GetParameterType(this ParamMetadata param)
        {
            return param._ParameterType;
        }

        public static void SetParameterType(this ParamMetadata param, Type type)
        {
            param._ParameterType = type;
        }
    }
}