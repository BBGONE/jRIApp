using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Xml.Linq;
using RIAPP.DataService.Resources;

namespace RIAPP.DataService.Utils
{
    public static class DiffGram
    {
        private static object GetValue(object obj, string propertyName)
        {
            var parts = propertyName.Split('.');
            var objType = obj.GetType();
            var pinfo = objType.GetProperty(parts[0]);
            if (pinfo == null)
                throw new Exception(string.Format(ErrorStrings.ERR_PROPERTY_IS_MISSING, objType.Name, propertyName));
            if (parts.Length == 1)
            {
                return pinfo.GetValue(obj, null);
            }
            var pval = pinfo.GetValue(obj, null);
            if (pval == null)
                throw new Exception(string.Format(ErrorStrings.ERR_PPROPERTY_ISNULL, objType.Name, pinfo.Name));
            return GetValue(pval, string.Join(".", parts.Skip(1).ToArray()));
        }

        private static Dictionary<string, object> GetValues(Type t, object obj, string[] propNames)
        {
            var res = new Dictionary<string, object>();
            if (obj == null)
                return res;
            foreach (var name in propNames)
            {
                res.Add(name, GetValue(obj, name));
            }
            return res;
        }

        public static string GetDiffGram(Dictionary<string, object> d1, Dictionary<string, object> d2, Type t)
        {
            var lst = new LinkedList<Vals>();

            foreach (var pnm in d1.Keys.Intersect(d2.Keys))
            {
                var val1 = d1[pnm];
                var val2 = d2[pnm];

                if (val2 != null && val1 != null)
                {
                    if (!val2.ToString().Equals(val1.ToString(), StringComparison.Ordinal))
                    {
                        lst.AddLast(new Vals
                        {
                            Val1 = Convert.ToString(val1, CultureInfo.InvariantCulture),
                            Val2 = Convert.ToString(val2, CultureInfo.InvariantCulture),
                            Name = pnm
                        });
                    }
                }
                else if (val1 == null && val2 != null)
                {
                    lst.AddLast(new Vals
                    {
                        Val1 = "NULL",
                        Val2 = Convert.ToString(val2, CultureInfo.InvariantCulture),
                        Name = pnm
                    });
                }
                else if (val1 != null && val2 == null)
                {
                    lst.AddLast(new Vals
                    {
                        Val1 = Convert.ToString(val1, CultureInfo.InvariantCulture),
                        Val2 = "NULL",
                        Name = pnm
                    });
                }
            }

            foreach (var pnm in d1.Keys.Except(d2.Keys))
            {
                var val1 = d1[pnm];
                if (val1 != null)
                {
                    lst.AddLast(new Vals
                    {
                        Val1 = Convert.ToString(val1, CultureInfo.InvariantCulture),
                        Val2 = "",
                        Name = pnm
                    });
                }
                else if (val1 == null)
                {
                    lst.AddLast(new Vals {Val1 = "NULL", Val2 = "", Name = pnm});
                }
            }

            foreach (var pnm in d2.Keys.Except(d1.Keys))
            {
                var val2 = d2[pnm];
                if (val2 != null)
                {
                    lst.AddLast(new Vals
                    {
                        Val1 = "",
                        Val2 = Convert.ToString(val2, CultureInfo.InvariantCulture),
                        Name = pnm
                    });
                }
                else if (val2 == null)
                {
                    lst.AddLast(new Vals {Val1 = "", Val2 = "NULL", Name = pnm});
                }
            }

            var x = new XElement("diffgram",
                from v in lst
                select new XElement(v.Name,
                    new XAttribute("old", v.Val1),
                    new XAttribute("new", v.Val2))
                );
            return x.ToString();
        }

        public static string GetDiffGram(object obj1, object obj2, Type t, string[] propNames)
        {
            var d1 = GetValues(t, obj1, propNames);
            var d2 = GetValues(t, obj2, propNames);
            return GetDiffGram(d1, d2, t);
        }

        private struct Vals
        {
            public string Name { get; set; }

            public string Val1 { get; set; }

            public string Val2 { get; set; }
        }
    }
}