using System;
using System.IO;
using System.Text;

namespace RIAppDemo.BLL.Utils
{
    public class ResourceHelper
    {
        public static string GetResourceString(string ID)
        {
            var a = typeof(ResourceHelper).Assembly;
            //string[] resNames = a.GetManifestResourceNames();
            using (var stream = a.GetManifestResourceStream(ID))
            {
                if (null == stream)
                {
                    throw new Exception("Can not find resource: \"" + ID + "\"");
                }
                var rd = new StreamReader(stream, Encoding.UTF8);
                var txt = rd.ReadToEnd();
                return txt;
            }
        }
    }
}