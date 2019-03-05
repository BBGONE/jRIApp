using RIAPP.DataService.Annotations.CodeGen;

namespace RIAppDemo.BLL.Models
{
    [Dictionary(KeyName = "key", DictionaryName = "RadioValDictionary")]
    public class RadioVal
    {
        public string key { get; set; }

        public string value { get; set; }

        public string comment { get; set; }
    }
}