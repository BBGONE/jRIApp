using System;

namespace RIAPP.DataService.Annotations.CodeGen
{
    [AttributeUsage(AttributeTargets.Class, Inherited = false)]
    public class ExtendsAttribute : Attribute
    {
        public ExtendsAttribute()
        {
            InterfaceNames = new string[0];
        }


        public string[] InterfaceNames { get; set; }
    }
}