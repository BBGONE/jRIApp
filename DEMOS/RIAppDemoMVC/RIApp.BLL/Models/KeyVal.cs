using RIAPP.DataService.Annotations.CodeGen;

namespace RIAppDemo.BLL.Models
{
    [Dictionary(KeyName = "key", DictionaryName = "KeyValDictionary")]
    [Comment(Text = "Generated from C# KeyVal model")]
    [TypeName("IKeyVal")]
    public class KeyVal
    {
        public int key { get; set; }

        public string val { get; set; }
    }
}