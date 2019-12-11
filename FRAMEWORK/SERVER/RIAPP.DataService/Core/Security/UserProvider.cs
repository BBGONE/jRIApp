using System;
using System.Security.Claims;

namespace RIAPP.DataService.Core.Security
{
    public class UserProvider : IUserProvider
    {
        private readonly Lazy<ClaimsPrincipal> _user;

        public UserProvider(Func<ClaimsPrincipal> userFactory)
        {
            _user = new Lazy<ClaimsPrincipal>(userFactory, true);
        }

        public ClaimsPrincipal User => _user.Value;
    }
}
