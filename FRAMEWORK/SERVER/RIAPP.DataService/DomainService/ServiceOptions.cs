using System.Security.Principal;
using RIAPP.DataService.DomainService.Interfaces;
using RIAPP.DataService.Utils.Interfaces;
using Microsoft.Extensions.DependencyInjection;

namespace RIAPP.DataService.DomainService
{
    public class ServiceOptions : IServiceOptions
    {
        public ServiceOptions(IServiceCollection services)
        {
            this.Services = services;
        }

        public IPrincipal User { get; set; }

        public ISerializer Serializer { get; set; }

        public IServiceCollection Services { get; }
    }
}