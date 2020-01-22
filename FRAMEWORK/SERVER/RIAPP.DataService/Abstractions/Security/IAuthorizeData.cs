using System.Security.Claims;

namespace RIAPP.DataService.Core.Security
{
    public interface IAuthorizeData
    {
        string[] Roles { get; }
        string RolesString { get; }
        bool IsAuthorized(ClaimsPrincipal user);
    }
}
