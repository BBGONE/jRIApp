using System;
using System.Security.Principal;
using RIAPP.DataService.DomainService.Interfaces;
using RIAPP.DataService.DomainService.Security;
using RIAPP.DataService.Utils;
using RIAPP.DataService.Utils.Interfaces;

namespace RIAPP.DataService.DomainService
{
    public class ServiceContainerFactory
    {
        public virtual IServiceContainer CreateServiceContainer(Type dataServiceType, IPrincipal principal)
        {
            var serviceContainer = new ServiceContainer();
            var authorizer = new AuthorizerClass(dataServiceType, principal);
            serviceContainer.AddService(typeof(IAuthorizer), authorizer);
            var valueConverter = new ValueConverter(serviceContainer);
            serviceContainer.AddService(typeof(IValueConverter), valueConverter);
            var dataHelper = new DataHelper(serviceContainer);
            serviceContainer.AddService(typeof(IDataHelper), dataHelper);
            var validationHelper = new ValidationHelper(serviceContainer);
            serviceContainer.AddService(typeof(IValidationHelper), validationHelper);
            return serviceContainer;
        }
    }
}