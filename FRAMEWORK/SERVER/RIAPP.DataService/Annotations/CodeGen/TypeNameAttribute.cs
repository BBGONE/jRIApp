using System;

namespace RIAPP.DataService.Annotations.CodeGen
{
    [AttributeUsage(AttributeTargets.Class, Inherited = false)]
    public class TypeNameAttribute : Attribute
    {
        public TypeNameAttribute(string name)
        {
            Name = name;
        }


        public string Name { get; set; }
    }
}