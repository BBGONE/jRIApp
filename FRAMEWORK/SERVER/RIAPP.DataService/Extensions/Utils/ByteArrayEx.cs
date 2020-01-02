using System.Text;

namespace RIAPP.DataService.Utils.Extensions
{
    public static class ByteArrayEx
    {
        public static string ConvertToString(this byte[] bytes)
        {
            if (bytes == null)
            {
                return null;
            }

            var sb = new StringBuilder(bytes.Length * 4);
            sb.Append("[");

            for (int i = 0; i < bytes.Length; ++i)
            {
                if (i > 0)
                {
                    sb.Append(",");
                }
                sb.Append(bytes[i]);
            }

            sb.Append("]");
            return sb.ToString();
        }
    }
}