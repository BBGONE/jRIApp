using RIAPP.DataService.Utils;
using System;
using System.Collections.Generic;
using System.Security.Principal;

namespace RIAPP.DataService.DomainService.Interfaces
{
    public interface IAuthorizer
    {
        IPrincipal principal { get; }
        Type serviceType { get; }
        void CheckUserRightsToExecute(IEnumerable<MethodInfoData> methods);
        void CheckUserRightsToExecute(MethodInfoData method);
    }

    public interface IAuthorizer<TService>: IAuthorizer
        where TService : BaseDomainService
    {

    }
}