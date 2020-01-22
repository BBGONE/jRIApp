using System;
using System.Security.Claims;

namespace RIAPP.DataService.Core.Security
{
    /// <summary>
    ///     This atribute assignes roles for the method or datamanager which override the roles assigned in the dataservice or
    ///     the other authorize attributes
    /// </summary>
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, Inherited = false)]
    public class DenyAttribute : AuthorizeAttribute, IDenyAuthorizeData
    {
        public DenyAttribute() : base()
        {
        }

        public override bool IsAuthorized(ClaimsPrincipal user)
        {
            foreach (var role in Roles)
            {
                if (user.IsInRole(role))
                {
                    return false;
                }
            }

            return true;
        }
    }
}