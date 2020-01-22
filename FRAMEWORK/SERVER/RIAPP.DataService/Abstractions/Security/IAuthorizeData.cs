using System.Security.Claims;
using System.Threading.Tasks;

namespace RIAPP.DataService.Core.Security
{
    public interface IAuthorizeData
    {
        string[] Roles { get; }
        string RolesString { get; }
        Task<bool> IsAuthorized(ClaimsPrincipal user);
    }
}
