using RIAPP.DataService.Utils;
using System;
using System.IO;
using System.Text;

namespace RIAPP.DataService.DomainService.CodeGen
{
    public class CodeGenTemplate: TemplateParser
    {
        private const string NAMESPACE = "RIAPP.DataService.Resources";

        private static string GetTemplate(string ID)
        {
            var a = typeof(CodeGenTemplate).Assembly;
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

        public CodeGenTemplate(string ID) :
            base(() => GetTemplate(ID))
        {
           
        }
    }
}