using System.Security.Claims;

namespace RIAPP.DataService.Core.Security
{
    public interface IUserProvider
    {
        ClaimsPrincipal User { get; }
    }
}
