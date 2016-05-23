using System.Security.Principal;
using RIAPP.DataService.Utils.Interfaces;

namespace RIAPP.DataService.DomainService.Interfaces
{
    public interface IServiceArgs
    {
        IPrincipal principal { get; }

        ISerializer serializer { get; }
    }
}