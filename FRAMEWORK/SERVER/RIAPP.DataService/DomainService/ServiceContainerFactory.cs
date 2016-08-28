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
        public virtual IServiceContainer CreateServiceContainer(Type dataServiceType, ISerializer serializer, IPrincipal principal)
        {
            var serviceContainer = new ServiceContainer();
            serviceContainer.AddService<ISerializer>(serializer);

            serviceContainer.AddService<IAuthorizer>(this.CreateAuthorizer(dataServiceType, principal));

            var valueConverter = this.CreateValueConverter(serializer);
            serviceContainer.AddService<IValueConverter>(valueConverter);

            var dataHelper = new DataHelper(valueConverter);
            serviceContainer.AddService<IDataHelper>(dataHelper);

            var validationHelper = new ValidationHelper(valueConverter);
            serviceContainer.AddService<IValidationHelper>(validationHelper);

            return serviceContainer;
        }

        public virtual IAuthorizer CreateAuthorizer(Type dataServiceType, IPrincipal principal)
        {
            return new AuthorizerClass(dataServiceType, principal);
        }

        public virtual IValueConverter CreateValueConverter(ISerializer serializer)
        {
            return new ValueConverter(serializer);
        }
    }
}