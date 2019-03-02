using RIAPP.DataService.DomainService.Metadata;
using System;
using System.Collections.Generic;
using System.Security.Principal;
using System.Threading.Tasks;

namespace RIAPP.DataService.DomainService.Security
{
    public interface IAuthorizer
    {
        IPrincipal User { get; }
        Type ServiceType { get; }
        Task CheckUserRightsToExecute(IEnumerable<MethodInfoData> methods);
        Task<bool> CanAccessMethod(MethodInfoData method);
        Task CheckUserRightsToExecute(MethodInfoData method);
    }

    public interface IAuthorizer<TService>: IAuthorizer
        where TService : BaseDomainService
    {

    }
}