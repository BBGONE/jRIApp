using System.Security.Principal;
using RIAPP.DataService.DomainService.Interfaces;
using RIAPP.DataService.Utils.Interfaces;

namespace RIAPP.DataService.DomainService
{
    public class ServiceArgs : IServiceArgs
    {
        public ServiceArgs(ISerializer serializer, IPrincipal principal)
        {
            this.serializer = serializer;
            this.principal = principal;
        }

        public IPrincipal principal { get; }

        public ISerializer serializer { get; }
    }
}