using System;
using System.Security.Principal;

namespace RIAPP.DataService.DomainService.Security
{
    public class UserProvider : IUserProvider
    {
        private readonly Func<IPrincipal> _userFactory;

        public UserProvider(Func<IPrincipal> userFactory)
        {
            _userFactory = userFactory;
        }

        public IPrincipal User => _userFactory();
    }
}
