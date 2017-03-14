using System.Security.Principal;
using RIAPP.DataService.Utils.Interfaces;
using Microsoft.Extensions.DependencyInjection;

namespace RIAPP.DataService.DomainService.Interfaces
{
    public interface IServiceArgs
    {
        IPrincipal Principal { get; }

        ISerializer Serializer { get; }

        IServiceCollection ServiceCollection { get; }
    }
}