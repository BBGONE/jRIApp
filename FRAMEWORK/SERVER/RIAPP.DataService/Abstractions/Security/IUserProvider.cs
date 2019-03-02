using System.Security.Principal;

namespace RIAPP.DataService.DomainService.Security
{
    public interface IUserProvider
    {
        IPrincipal User { get; }
    }
}
