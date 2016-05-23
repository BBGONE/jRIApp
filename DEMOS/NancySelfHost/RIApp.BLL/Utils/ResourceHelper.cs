using System;
using System.Reflection;
using System.IO;

namespace RIAppDemo.BLL.Utils
{
    public class ResourceHelper
    {
        public static string GetResourceString(string ID)
        {
            Assembly a = typeof(ResourceHelper).Assembly;
            //string[] resNames = a.GetManifestResourceNames();
            using (System.IO.Stream stream = a.GetManifestResourceStream(ID))
            {
                if ((null == stream))
                {
                    throw new Exception("Can not find resource: \"" + ID + "\"");
                }
                StreamReader rd = new StreamReader(stream, System.Text.Encoding.UTF8);
                string txt = rd.ReadToEnd();
                return txt;
            }
        }
    }
}
