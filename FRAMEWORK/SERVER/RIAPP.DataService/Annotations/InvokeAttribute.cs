using System;

namespace RIAPP.DataService.Annotations
{
    [AttributeUsage(AttributeTargets.Method, Inherited = false)]
    public class InvokeAttribute : Attribute
    {
    }
}