using System.Security.Principal;
using RIAPP.DataService.Utils.Interfaces;
using Microsoft.Extensions.DependencyInjection;

namespace RIAPP.DataService.DomainService.Interfaces
{
    public interface IServiceOptions
    {
        IPrincipal User { get; set; }

        ISerializer Serializer { get; set; }

        IServiceCollection Services { get; }
    }
}