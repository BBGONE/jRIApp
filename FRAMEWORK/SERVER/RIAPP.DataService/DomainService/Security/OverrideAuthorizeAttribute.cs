using System;

namespace RIAPP.DataService.DomainService.Security
{
    /// <summary>
    ///     This atribute assignes roles for the method or datamanager which override the roles assigned in the dataservice or
    ///     the other authorize attributes
    /// </summary>
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, Inherited = false)]
    public class OverrideAuthorizeAttribute : Attribute
    {
        public OverrideAuthorizeAttribute()
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
    }
}