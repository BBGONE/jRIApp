using Net451.Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Security.Principal;

namespace RIAPP.DataService.Core.Config
{
    public class ServiceOptions : IServiceOptions
    {
        public ServiceOptions(IServiceCollection services)
        {
            this.Services = services;
            this.DataManagerRegister = new DataManagerRegister();
            this.ValidatorRegister = new ValidatorRegister();
        }

        public Func<IServiceProvider, IPrincipal> UserFactory { get; set; }

        public Func<IEnumerable<Type>> ClientTypes { get; set; }

        public IValidatorRegister ValidatorRegister
        {
            get;
        }

        public IDataManagerRegister DataManagerRegister
        {
            get;
        }

        public IServiceCollection Services
        {
            get;
        }
    }
}