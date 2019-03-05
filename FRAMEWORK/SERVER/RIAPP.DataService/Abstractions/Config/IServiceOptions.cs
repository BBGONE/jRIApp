using Net451.Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Security.Principal;

namespace RIAPP.DataService.Core.Config
{
    public interface IServiceOptions
    {
        Func<IServiceProvider, IPrincipal> UserFactory { get; }

        Func<IEnumerable<Type>> ClientTypes { get; }

        IValidatorRegister ValidatorRegister { get; }

        IDataManagerRegister DataManagerRegister { get; }

        IServiceCollection Services { get; }
    }
}