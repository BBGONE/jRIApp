using System;
using System.Text;

namespace RIAPP.DataService.Utils.Extensions
{
    public static class StringEx
    {
        public static string ToCamelCase(this string str)
        {
            return str.Length > 1 ? str.Substring(0, 1).ToLower() + str.Substring(1, str.Length - 1) : str.ToLower();
        }

        public static object ConvertToBinary(this string value)
        {
            var sb = new StringBuilder(value);
            sb.Remove(sb.Length - 1, 1); //remove ]
            sb.Remove(0, 1); //remove [

            int cnt = sb.Length, bytesCnt = cnt > 0 ? 1 : 0;

            for (int i = 0; i < cnt; ++i)
            {
                if (sb[i] == ',')
                {
                    bytesCnt += 1;
                }
            }

            byte[] bytes = new byte[bytesCnt];
            bytesCnt = 0; //calculate again
            string val = "";

            for (int i = 0; i < cnt; ++i)
            {
                if (sb[i] == ',')
                {
                    bytes[bytesCnt] = byte.Parse(val);
                    bytesCnt += 1;
                    val = "";
                }
                else
                {
                    if (sb[i] != '"' && sb[i] != ' ')
                        val += sb[i];
                }
            }

            if (val != "")
            {
                bytes[bytesCnt] = byte.Parse(val);
                bytesCnt += 1;
            }

            byte[] bytes2;

            if (bytesCnt < bytes.Length)
            {
                bytes2 = new byte[bytesCnt];
                Buffer.BlockCopy(bytes, 0, bytes2, 0, bytesCnt);
            }
            else
            {
                bytes2 = bytes;
            }

            return bytes2;
        }
    }
}