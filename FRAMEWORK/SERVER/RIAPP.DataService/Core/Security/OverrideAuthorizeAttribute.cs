using System;

namespace RIAPP.DataService.Core.Security
{
    /// <summary>
    ///     This atribute assignes roles for the method or datamanager which override the roles assigned in the dataservice or
    ///     the other authorize attributes
    /// </summary>
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, Inherited = false)]
    public class OverrideAuthorizeAttribute : AuthorizeAttribute, IOverrideAuthorizeData
    {
        public OverrideAuthorizeAttribute(): base()
        {
        }
    }
}