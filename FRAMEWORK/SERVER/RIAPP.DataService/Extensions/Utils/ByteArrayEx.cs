using System;
using System.Text;

namespace RIAPP.DataService.Utils.Extensions
{
    public static class ByteArrayEx
    {
        static readonly string[] BYTES_MAP = new string[256];

        static ByteArrayEx()
        {
            for (int i = 0; i < 256; ++i)
            {
                BYTES_MAP[i] = i.ToString();
            }
        }

        public static string ConvertToString(this byte[] bytes)
        {
            if (bytes == null)
            {
                return null;
            }

            int len = 2;

            for (int i = 0; i < bytes.Length; ++i)
            {
                if (i > 0)
                {
                    ++len; //for comma
                }

                byte val = bytes[i];
                if (val < 10)
                {
                    ++len;
                }
                else if (val < 100)
                {
                    len += 2;
                }
                else
                {
                    len += 3;
                }
            }

            char[] chars = new char[len];

            chars[0] = '[';
            chars[len-1] = ']';
            int pos = 1;
            
            foreach(var val in bytes)
            {
                if (pos > 1)
                {
                    chars[pos++] = ',';
                }
                string str = BYTES_MAP[val];
                foreach(var ch in str)
                {
                    chars[pos++] = ch;
                }
            }
     
            return new String(chars);
        }
    }
}