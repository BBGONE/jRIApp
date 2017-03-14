using System.Security.Principal;
using RIAPP.DataService.DomainService.Interfaces;
using RIAPP.DataService.Utils.Interfaces;
using Microsoft.Extensions.DependencyInjection;

namespace RIAPP.DataService.DomainService
{
    public class ServiceArgs : IServiceArgs
    {
        public ServiceArgs(ISerializer serializer, IPrincipal principal)
        {
            this.Serializer = serializer;
            this.Principal = principal;
            var serviceCollection = new ServiceCollection();
            serviceCollection.AddSingleton<ISerializer>(serializer);
            serviceCollection.AddSingleton<IPrincipal>(principal);
            this.ServiceCollection = serviceCollection;
        }

        public IPrincipal Principal { get; }

        public ISerializer Serializer { get; }

        public IServiceCollection ServiceCollection { get; }

        /// <summary>
        /// Used as a convenience method to add a service to the ServiceCollection
        /// </summary>
        /// <typeparam name="TService"></typeparam>
        /// <param name="implementationInstance"></param>
        public void AddSingleton<TService>(TService implementationInstance)
           where TService : class
        {
            this.ServiceCollection.AddSingleton<TService>(implementationInstance);
        }
    }
}