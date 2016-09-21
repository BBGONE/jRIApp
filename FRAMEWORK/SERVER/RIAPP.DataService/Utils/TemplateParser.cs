using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace RIAPP.DataService.Utils
{
    public class TemplateParser
    {
        private const char LEFT_CHAR = '{';
        private const char RIGHT_CHAR = '}';

        public TemplateParser(string resourceID):
            this(()=> ResourceHelper.GetResourceString(resourceID))
        {
         
        }

        public TemplateParser(Func<string> templateProvider)
        {
            var template = templateProvider();
            DocParts = ParseTemplate(template);
        }

        public IEnumerable<DocPart> DocParts { get; }

        private DocPart GetDocPart(string str)
        {
            var parts = str.Split(':').Select(s => s.Trim()).ToArray();

            return new DocPart
            {
                isPlaceHolder = true,
                value = parts[0].ToUpperInvariant(),
                format = parts.Length > 1 ? parts[1] : null
            };
        }

        private IEnumerable<DocPart> ParseTemplate(string template)
        {
            char? prevChar = null;
            var isPlaceHolder = false;
            var list = new LinkedList<DocPart>();

            var sb = new StringBuilder(512);

            var chars = template.ToCharArray();
            for (var i = 0; i < chars.Length; ++i)
            {
                var ch = chars[i];


                if (ch == LEFT_CHAR)
                {
                    if (prevChar == LEFT_CHAR)
                    {
                        if (sb.Length > 0)
                        {
                            list.AddLast(new DocPart {isPlaceHolder = false, value = sb.ToString()});
                            sb = new StringBuilder();
                        }
                        isPlaceHolder = true;
                    }
                }
                else if (isPlaceHolder && ch == RIGHT_CHAR)
                {
                    if (prevChar == RIGHT_CHAR)
                    {
                        list.AddLast(GetDocPart(sb.ToString()));
                        isPlaceHolder = false;
                        sb = new StringBuilder();
                    }
                }
                else if (isPlaceHolder && prevChar == RIGHT_CHAR)
                {
                    sb.Append(prevChar);
                    sb.Append(ch);
                }
                else if (!isPlaceHolder && prevChar == LEFT_CHAR)
                {
                    sb.Append(prevChar);
                    sb.Append(ch);
                }
                else
                    sb.Append(ch);

                prevChar = ch;
            }

            if (sb.Length > 0)
                list.AddLast(new DocPart {isPlaceHolder = false, value = sb.ToString()});

            return list;
        }

        public void ProcessParts(Action<DocPart> fn_partsHandler)
        {
            var parts = DocParts.ToList();
            parts.ForEach(part => { fn_partsHandler(part); });
        }

        public static void ProcessTemplate(TemplateParser parser, IDictionary<string, Func<string>> partsProvider, StringBuilder result)
        {
            parser.ProcessParts(part =>
            {
                if (!part.isPlaceHolder)
                {
                    result.Append(part.value);
                }
                else
                {
                    if (partsProvider.ContainsKey(part.value))
                        result.Append(partsProvider[part.value]());
                }
            });
        }

        public static void ProcessTemplate(string templateName, IDictionary<string, Func<string>> partsProvider, StringBuilder result)
        {
            ProcessTemplate(new TemplateParser(templateName), partsProvider, result);
        }

        public static string ProcessTemplate(string templateName, IDictionary<string, Func<string>> partsProvider)
        {
            StringBuilder result = new StringBuilder();
            ProcessTemplate(new TemplateParser(templateName), partsProvider, result);
            return result.ToString();
        }

        public static string ProcessTemplate(TemplateParser parser, IDictionary<string, Func<string>> partsProvider)
        {
            StringBuilder result = new StringBuilder();
            ProcessTemplate(parser, partsProvider, result);
            return result.ToString();
        }

        public struct DocPart
        {
            public bool isPlaceHolder;
            public string value;
            public string format;
        }
    }
}