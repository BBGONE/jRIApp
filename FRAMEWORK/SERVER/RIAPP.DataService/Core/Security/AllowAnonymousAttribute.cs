using System;

namespace RIAPP.DataService.Core.Security
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, Inherited = false)]
    public class AllowAnonymousAttribute : Attribute, IAllowAnonymous
    {
    }
}