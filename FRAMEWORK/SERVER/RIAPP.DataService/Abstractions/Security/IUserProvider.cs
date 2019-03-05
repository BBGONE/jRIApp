using System.Security.Principal;

namespace RIAPP.DataService.Core.Security
{
    public interface IUserProvider
    {
        IPrincipal User { get; }
    }
}
