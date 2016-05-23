using System;
using RIAPP.DataService.Utils.Interfaces;
using System.Security.Principal;
using RIAPP.DataService.DomainService;
using RIAPP.DataService.DomainService.Interfaces;
using RIAPP.DataService.LinqSql.Utils;

namespace RIAPP.DataService.LinqSql
{

    public class LinqServiceContainerFactory : ServiceContainerFactory
    {
        public override IServiceContainer CreateServiceContainer(Type dataServiceType, IPrincipal principal)
        {
            var serviceContainer = base.CreateServiceContainer(dataServiceType, principal);
            serviceContainer.ReplaceService(typeof(IValueConverter), new LinqValueConverter(serviceContainer));
            return serviceContainer;
        }
    }
}
