using System;
using System.Collections.Generic;
using System.Security.Principal;
using RIAPP.DataService.Utils;

namespace RIAPP.DataService.DomainService.Interfaces
{
    public interface IAuthorizer
    {
        IPrincipal principal { get; }
        Type serviceType { get; }
        void CheckUserRightsToExecute(IEnumerable<MethodInfoData> methods);
        void CheckUserRightsToExecute(MethodInfoData method);
    }
}