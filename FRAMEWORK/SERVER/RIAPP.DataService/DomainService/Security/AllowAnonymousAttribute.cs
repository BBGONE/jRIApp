using System;

namespace RIAPP.DataService.DomainService.Security
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, Inherited = false)]
    public class AllowAnonymousAttribute : Attribute, IAllowAnonymous
    {
    }
}