using System;
using System.Security.Principal;

namespace RIAPP.DataService.Core.Security
{
    public class UserProvider : IUserProvider
    {
        private readonly IPrincipal _user;

        public UserProvider(Func<IPrincipal> userFactory)
        {
            _user = userFactory();
        }

        public IPrincipal User => _user;
    }
}
