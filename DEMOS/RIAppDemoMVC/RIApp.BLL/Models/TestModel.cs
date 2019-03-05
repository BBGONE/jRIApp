using RIAPP.DataService.Annotations.CodeGen;
using System.Collections.Generic;

namespace RIAppDemo.BLL.Models
{
    /// <summary>
    ///     this enum will be generated in typescript because it is used in exposed TestModel class
    /// </summary>
    public enum TestEnum
    {
        None = 0,

        OK = 1,

        Error = 2,

        Loading = 3
    }

    [Comment(Text = "An enum for testing of conversion C# types to typescript")]
    public enum TestEnum2
    {
        None = 0,

        One = 1,

        Two = 2,

        Three = 3
    }

    [Dictionary(KeyName = "Key", DictionaryName = "TestDictionary")]
    [List(ListName = "TestList")]
    [Comment(Text = "A Class for testing of conversion C# types to typescript")]
    [TypeName("IClientTestModel")]
    public class TestModel
    {
        public string Key { get; set; }

        public string SomeProperty1 { get; set; }

        public byte[] SomeProperty2 { get; set; }

        public IEnumerable<string> SomeProperty3 { get; set; }

        public IEnumerable<LookUpProduct> MoreComplexProperty { get; set; }

        public TestEnum EnumProperty { get; set; }
    }
}