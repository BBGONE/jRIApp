namespace RIAPP.DataService.Core.Metadata
{
    public static class MethodDescriptionEx
    {
        public static MethodInfoData GetMethodData(this MethodDescription methodDescription)
        {
            return methodDescription._methodData;
        }
    }
}