using RIAPP.DataService.Resources;
using RIAPP.DataService.Utils;
using System;
using System.Security.Claims;

namespace RIAPP.DataService.Core.Security
{
    public class AuthorizationContext
    {
        private readonly IUserProvider _userProvider;

        public AuthorizationContext(BaseDomainService service, IUserProvider userProvider, IServiceFactory serviceFactory)
        {
            this.Service = service;
            this._userProvider = userProvider ?? throw new ArgumentNullException(nameof(userProvider), ErrorStrings.ERR_NO_USER);
            this.ServiceFactory = serviceFactory ?? throw new ArgumentNullException(nameof(serviceFactory));
        }

        public ClaimsPrincipal User
        {
            get
            {
                return this._userProvider.User;
            }
        }

        public BaseDomainService Service { get; }

        public IServiceFactory ServiceFactory { get; }
    }

    public class AuthorizationContext<TService>: AuthorizationContext
        where TService : BaseDomainService
    {
        public AuthorizationContext(TService service, IUserProvider userProvider, IServiceFactory<TService> serviceFactory)
            :base(service, userProvider, serviceFactory)
        {
        }

        public new TService Service { get { return (TService)base.Service; } }

        public new IServiceFactory<TService> ServiceFactory { get { return (IServiceFactory<TService>)base.ServiceFactory; } }
    }
}