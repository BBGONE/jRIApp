using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using RIAPP.DataService.DomainService.Exceptions;
using RIAPP.DataService.DomainService.Interfaces;
using RIAPP.DataService.Resources;
using RIAPP.DataService.Utils;

namespace RIAPP.DataService.DomainService.Security
{
    public class AuthorizerClass : IAuthorizer
    {
        private const string ANONYMOUS_USER = "Anonymous";
        private IEnumerable<string> _serviceRoles;

        public AuthorizerClass(Type serviceType, IPrincipal principal)
        {
            this.serviceType = serviceType;
            if (principal == null)
            {
                IIdentity identity = new GenericIdentity(string.Empty);
                IPrincipal unauthentcated = new GenericPrincipal(identity, new string[0]);
                this.principal = unauthentcated;
            }
            else
                this.principal = principal;
        }

        /// <summary>
        ///     throws AccesDeniedExeption if user have no rights to execute operation
        /// </summary>
        /// <param name="changeSet"></param>
        public void CheckUserRightsToExecute(IEnumerable<MethodInfoData> methods)
        {
            var roles = SecurityHelper.GetRoleTree(GetRolesForService(), methods);

            if (!CheckAccess(roles))
            {
                var user = principal == null || principal.Identity == null || !principal.Identity.IsAuthenticated
                    ? ANONYMOUS_USER
                    : principal.Identity.Name;
                throw new AccessDeniedException(string.Format(ErrorStrings.ERR_USER_ACCESS_DENIED, user));
            }
        }

        /// <summary>
        ///     throws AccesDeniedExeption if user have no rights to execute operation
        /// </summary>
        /// <param name="changeSet"></param>
        public void CheckUserRightsToExecute(MethodInfoData method)
        {
            var roles = SecurityHelper.GetRoleTree(GetRolesForService(), new[] {method});

            if (!CheckAccess(roles))
            {
                var user = principal == null || principal.Identity == null || !principal.Identity.IsAuthenticated
                    ? ANONYMOUS_USER
                    : principal.Identity.Name;
                throw new AccessDeniedException(string.Format(ErrorStrings.ERR_USER_ACCESS_DENIED, user));
            }
        }

        public IPrincipal principal { get; }

        public Type serviceType { get; }

        #region Private methods

        private bool CheckAccessCore(IEnumerable<string> roles)
        {
            if (principal == null)
                return false;
            if (roles == null || !roles.Any())
                return true;
            if (!principal.Identity.IsAuthenticated &&
                roles.Contains(SecurityHelper.AUTHENTICATED, StringComparer.Ordinal))
                return false;
            var filteredRoles = roles.Where(r => !r.Equals(SecurityHelper.AUTHENTICATED, StringComparison.Ordinal));
            if (!filteredRoles.Any())
                return true;
            foreach (var role in filteredRoles)
            {
                if (principal.IsInRole(role))
                {
                    return true;
                }
            }
            return false;
        }

        private IEnumerable<string> GetRolesForService()
        {
            if (_serviceRoles != null)
                return _serviceRoles;
            _serviceRoles = SecurityHelper.GetRolesFromType(serviceType);
            return _serviceRoles;
        }

        private bool CheckMethodAccess(bool allowServiceAccess, IEnumerable<SecurityHelper.RolesForMethod> methodRoles)
        {
            var result = true;
            foreach (var rolesForMethod in methodRoles)
            {
                var allowAnonymous =
                    rolesForMethod.Roles.Any(r => r.Equals(SecurityHelper.ALLOW_ANONYMOUS, StringComparison.Ordinal));
                if (allowAnonymous)
                {
                    continue;
                }

                if (principal == null)
                {
                    result = false;
                    break;
                }

                //if not the method overrides roles for the service
                if (!rolesForMethod.IsRolesOverride && !allowServiceAccess)
                {
                    //first check roles assigned to the service as a whole
                    result = false;
                    break;
                }

                //check the roles assigned for the method
                var meth_roles =
                    rolesForMethod.Roles.Where(r => !r.Equals(SecurityHelper.ALLOW_ANONYMOUS, StringComparison.Ordinal));
                if (!CheckAccessCore(meth_roles))
                {
                    result = false;
                    break;
                }
            }
            return result;
        }

        private bool CheckOwnerAccess(bool allowServiceAccess, SecurityHelper.RolesForOwner rolesForOwner)
        {
            var allowAnonymous =
                rolesForOwner.Roles.Any(r => r.Equals(SecurityHelper.ALLOW_ANONYMOUS, StringComparison.Ordinal));
            if (allowAnonymous)
            {
                return true;
            }

            if (principal == null)
            {
                return false;
            }

            //if not the method overrides roles for the service
            if (!rolesForOwner.IsRolesOverride && !allowServiceAccess)
            {
                return false;
            }

            //check the roles assigned for the owner
            var owner_roles =
                rolesForOwner.Roles.Where(r => !r.Equals(SecurityHelper.ALLOW_ANONYMOUS, StringComparison.Ordinal));
            if (!CheckAccessCore(owner_roles))
            {
                return false;
            }
            return true;
        }

        private bool CheckAccess(SecurityHelper.RoleTree rolesTree)
        {
            var result = true;
            //check roles assigned to the service as a whole
            var allowServiceAccess = CheckAccessCore(rolesTree.Roles);
            if (rolesTree.methodRoles.Any())
            {
                result = CheckMethodAccess(allowServiceAccess, rolesTree.methodRoles);

                if (!result)
                    return result;
            }
            else if (!rolesTree.ownerRoles.Any())
                return allowServiceAccess;

            foreach (var rolesForOwner in rolesTree.ownerRoles)
            {
                var allowOwnerAccess = CheckOwnerAccess(allowServiceAccess, rolesForOwner);
                result = CheckMethodAccess(allowOwnerAccess, rolesForOwner.methodRoles);
                if (!result)
                {
                    break;
                }
            }

            return result;
        }

        #endregion
    }
}