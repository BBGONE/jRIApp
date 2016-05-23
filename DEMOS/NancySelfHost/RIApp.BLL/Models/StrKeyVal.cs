using RIAPP.DataService.DomainService.Attributes;

namespace RIAppDemo.BLL.Models
{

    [Dictionary(KeyName="key", DictionaryName="StrKeyValDictionary")]
    [Comment(Text="Generated from C# StrKeyVal model")]
    public class StrKeyVal
    {
        public string key
        {
            get;
            set;
        }

        public string val
        {
            get;
            set;
        }
    }
}
