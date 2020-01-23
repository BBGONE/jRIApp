using RIAPP.DataService.Core.Metadata;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RIAPP.DataService.Core.Security
{
    public interface IAuthorizer
    {
        AuthorizationContext AuthorizationContext { get; }
        Task CheckUserRightsToExecute(IEnumerable<MethodInfoData> methods);
        Task<bool> CanAccessMethod(MethodInfoData method);
        Task CheckUserRightsToExecute(MethodInfoData method);
    }

    public interface IAuthorizer<TService> : IAuthorizer
        where TService : BaseDomainService
    {

    }
}