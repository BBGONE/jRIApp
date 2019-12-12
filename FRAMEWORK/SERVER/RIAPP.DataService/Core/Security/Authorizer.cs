using RIAPP.DataService.Core.Exceptions;
using RIAPP.DataService.Core.Metadata;
using RIAPP.DataService.Resources;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace RIAPP.DataService.Core.Security
{
    public class Authorizer<TService> : IAuthorizer<TService>
        where TService : BaseDomainService
    {
        private const string ANONYMOUS_USER = "ANONYMOUS_USER";

        private Lazy<IEnumerable<IAuthorizeData>> _serviceAuthorization;
        private readonly IUserProvider _userProvider;

        public Authorizer(TService service, IUserProvider userProvider)
        {
            this.ServiceType = service.GetType();
            this._userProvider = userProvider ?? throw new ArgumentNullException(nameof(userProvider), ErrorStrings.ERR_NO_USER);
            this._serviceAuthorization = new Lazy<IEnumerable<IAuthorizeData>>(() => ServiceType.GetTypeAuthorization(), true);
        }

        public ClaimsPrincipal User
        {
            get
            {
                return this._userProvider.User;
            }
        }

        public Type ServiceType { get; }

        /// <summary>
        ///  throws AccesDeniedExeption if user have no rights to execute operation
        /// </summary>
        /// <param name="changeSet"></param>
        public async Task CheckUserRightsToExecute(IEnumerable<MethodInfoData> methods)
        {
            var authorizationTree = GetServiceAuthorization().GetAuthorizationTree(methods);

            if (!await CheckAccess(authorizationTree))
            {
                var user = this.User == null || this.User.Identity == null || !this.User.Identity.IsAuthenticated
                    ? ANONYMOUS_USER
                    : this.User.Identity.Name;
                throw new AccessDeniedException(string.Format(ErrorStrings.ERR_USER_ACCESS_DENIED, user));
            }
        }

        public Task<bool> CanAccessMethod(MethodInfoData method)
        {
            var authorizationTree = GetServiceAuthorization().GetAuthorizationTree(new[] { method });
            return CheckAccess(authorizationTree);
        }

        /// <summary>
        ///   throws AccesDeniedExeption if user have no rights to execute operation
        /// </summary>
        /// <param name="changeSet"></param>
        public async Task CheckUserRightsToExecute(MethodInfoData method)
        {
            if (!await CanAccessMethod(method))
            {
                var user = this.User == null || this.User.Identity == null || !this.User.Identity.IsAuthenticated
                    ? ANONYMOUS_USER
                    : this.User.Identity.Name;
                throw new AccessDeniedException(string.Format(ErrorStrings.ERR_USER_ACCESS_DENIED, user));
            }
        }

        #region Private methods

        private async Task<bool> CheckAccessCore(IEnumerable<IAuthorizeData> authorizeData)
        {
            await Task.CompletedTask;

            if (User == null)
                return false;

            if (authorizeData == null || !authorizeData.Any())
                return true;

            if (!User.Identity.IsAuthenticated && authorizeData.Any())
                return false;

            int cnt = 0;
            foreach (var role in authorizeData.SelectMany(a=>a.Roles))
            {
                ++cnt;
                if (User.IsInRole(role))
                {
                    return true;
                }
            }

            return cnt > 0 ? false : true;
        }

        private IEnumerable<IAuthorizeData> GetServiceAuthorization()
        {
            return _serviceAuthorization.Value;
        }

        /// <summary>
        /// Checks access to multiple methods. If access to one method fails, then the access is blocked to all the methods
        /// </summary>
        /// <param name="allowServiceAccess"></param>
        /// <param name="methodAuthorizations"></param>
        /// <returns></returns>
        private async Task<bool> CheckMethodAccess(bool allowServiceAccess, IEnumerable<MethodAuthorization> methodAuthorizations)
        {
            bool result = true;

            foreach (var methodAuthorization in methodAuthorizations)
            {
                if (methodAuthorization.IsAllowAnonymous)
                {
                    continue;
                }

                if (User == null)
                {
                    result = false;
                    break;
                }

                // if the method does not override authorization for the service
                if (!methodAuthorization.IsOverride && !allowServiceAccess)
                {
                    // first check authorization at the service level
                    result = false;
                    break;
                }

                // check authorization for the method
                if (!await CheckAccessCore(methodAuthorization.AuthorizeData))
                {
                    result = false;
                    break;
                }
            }

            return result;
        }

        private async Task<bool> CheckOwnerAccess(bool allowServiceAccess, DataManagerAuthorization ownerAuthorization)
        {
            if (ownerAuthorization.IsAllowAnonymous)
            {
                return true;
            }

            if (User == null)
            {
                return false;
            }

            // if it does not ovveride authorization for the service
            if (!ownerAuthorization.IsOverride && !allowServiceAccess)
            {
                return false;
            }

            // check authorization for the owner
            if (!await CheckAccessCore(ownerAuthorization.AuthorizeData))
            {
                return false;
            }

            return true;
        }

        private async Task<bool> CheckAccess(AuthorizationTree authorizationTree)
        {
            bool result = true;
            // check authorization at the service level
            bool allowServiceAccess = await CheckAccessCore(authorizationTree.DataServiceAuthorization);

            if (authorizationTree.MethodsAuthorization.Any())
            {
                result = await CheckMethodAccess(allowServiceAccess, authorizationTree.MethodsAuthorization);

                if (!result)
                    return result;
            }
            else if (!authorizationTree.DataManagersAuthorization.Any())
            {
                return allowServiceAccess;
            }

            foreach (var ownerAuthorization in authorizationTree.DataManagersAuthorization)
            {
                bool allowOwnerAccess = await CheckOwnerAccess(allowServiceAccess, ownerAuthorization);
                result = await CheckMethodAccess(allowOwnerAccess, ownerAuthorization.MethodsAuthorization);

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