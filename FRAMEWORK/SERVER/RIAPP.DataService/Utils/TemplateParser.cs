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
     
        public TemplateParser(string template)
        {
            DocParts = new Lazy<IEnumerable<DocPart>>(() => ParseTemplate(template), true);
        }

        public Lazy<IEnumerable<DocPart>> DocParts { get; }

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

        public void ProcessParts(Action<DocPart> partHandler)
        {
            foreach (var part in DocParts.Value)
            {
                partHandler(part);
            }
        }

        public static void ProcessTemplate(TemplateParser parser, IDictionary<string, Func<string>> parts, StringBuilder result)
        {
            parser.ProcessParts(part =>
            {
                if (!part.isPlaceHolder)
                {
                    result.Append(part.value);
                }
                else
                {
                    if (parts.ContainsKey(part.value))
                        result.Append(parts[part.value]());
                }
            });
        }

        public static string ProcessTemplate(TemplateParser parser, IDictionary<string, Func<string>> parts)
        {
            StringBuilder result = new StringBuilder();
            ProcessTemplate(parser, parts, result);
            return result.ToString();
        }

        public static string ProcessTemplate(string template, IDictionary<string, Func<string>> parts)
        {
            return ProcessTemplate(new TemplateParser(template), parts);
        }

        public static void ProcessTemplate(string template, IDictionary<string, Func<string>> parts, StringBuilder result)
        {
            ProcessTemplate(new TemplateParser(template), parts, result);
        }

        public struct DocPart
        {
            public bool isPlaceHolder;
            public string value;
            public string format;
        }
    }
}