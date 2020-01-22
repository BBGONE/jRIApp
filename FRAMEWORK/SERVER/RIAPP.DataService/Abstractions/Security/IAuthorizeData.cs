using System.Security.Claims;
using System.Threading.Tasks;

namespace RIAPP.DataService.Core.Security
{
    public interface IAuthorizeData
    {
        Task<bool> IsAuthorized(ClaimsPrincipal user);
    }
}
