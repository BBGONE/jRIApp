using System;

namespace RIAPP.DataService.Annotations.CodeGen
{
    [AttributeUsage(AttributeTargets.Class, Inherited = false)]
    public class DictionaryAttribute : Attribute
    {
        /// <summary>
        ///     The name of the property on class that is the dictionary's key
        /// </summary>
        public string KeyName { get; set; }

        /// <summary>
        ///     The name of the typed dictionary that will be generated on the client
        /// </summary>
        public string DictionaryName { get; set; }
    }
}