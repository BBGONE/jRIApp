using System;
using System.IO;
using System.Text;

namespace RIAPP.DataService.Utils
{
    public class ResourceStringHelper
    {
        private const string NAMESPACE = "RIAPP.DataService.Resources";

        public static string Get(string ID)
        {
            var a = typeof(ResourceStringHelper).Assembly;
            //string[] resNames = a.GetManifestResourceNames();
            using (var stream = a.GetManifestResourceStream(string.Format("{0}.{1}", NAMESPACE, ID)))
            {
                if (null == stream)
                {
                    throw new Exception("Can not find embedded string resource: \"" + ID + "\"");
                }
                var rd = new StreamReader(stream, Encoding.UTF8);
                var txt = rd.ReadToEnd();
                return txt;
            }
        }
    }
}
