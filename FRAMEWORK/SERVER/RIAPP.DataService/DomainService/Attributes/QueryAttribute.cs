using System;

namespace RIAPP.DataService.DomainService.Attributes
{
    [AttributeUsage(AttributeTargets.Method, Inherited = false)]
    public class QueryAttribute : Attribute
    {
    }
}