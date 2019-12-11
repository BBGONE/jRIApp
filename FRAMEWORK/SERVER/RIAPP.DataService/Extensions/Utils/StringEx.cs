namespace RIAPP.DataService.Utils.Extensions
{
    public static class StringEx
    {
        public static string ToCamelCase(this string str)
        {
            return str.Length > 1 ? str.Substring(0, 1).ToLower() + str.Substring(1, str.Length - 1) : str.ToLower();
        }
    }
}