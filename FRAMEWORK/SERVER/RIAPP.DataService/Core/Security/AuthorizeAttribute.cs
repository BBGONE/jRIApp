using System;
using System.Security.Claims;

namespace RIAPP.DataService.Core.Security
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = true, Inherited = false)]
    public class AuthorizeAttribute : Attribute, IAuthorizeData
    {
        public AuthorizeAttribute()
        {
            Roles = new string[0];
        }

        public string[] Roles { get; set; }

        public string RolesString
        {
            get { return string.Join(",", Roles); }
            set
            {
                if (string.IsNullOrWhiteSpace(value))
                {
                    Roles = new string[0];
                }
                else
                {
                    Roles = value.Split(',', ';');
                }
            }
        }

        public virtual bool IsAuthorized(ClaimsPrincipal user)
        {
            int cnt = 0;

            foreach (var role in Roles)
            {
                ++cnt;

                if (user.IsInRole(role))
                {
                    return true;
                }
            }

            return cnt > 0 ? false : true;
        }
    }
}