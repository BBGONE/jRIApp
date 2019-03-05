using System;

namespace RIAPP.DataService.Annotations.CodeGen
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Struct | AttributeTargets.Enum, Inherited = false)]
    public class CommentAttribute : Attribute
    {
        public string Text { get; set; }
    }
}