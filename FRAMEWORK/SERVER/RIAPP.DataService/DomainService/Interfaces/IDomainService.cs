using System;
using System.Threading.Tasks;
using RIAPP.DataService.DomainService.Types;

namespace RIAPP.DataService.DomainService.Interfaces
{
    public interface IDomainService : IDisposable
    {
        //typescript strongly typed implementation of entities, DbSet and DbContext in the text form
        string ServiceGetTypeScript(string comment = null);
        string ServiceGetXAML(bool isDraft = true);
        string ServiceGetCSharp();

        //information about permissions to execute service operations for the client
        Permissions ServiceGetPermissions();
        //information about service methods, DbSets and their fields information
        MetadataResult ServiceGetMetadata();

        Task<QueryResponse> ServiceGetData(QueryRequest request);
        Task<ChangeSet> ServiceApplyChangeSet(ChangeSet changeSet);
        Task<RefreshInfo> ServiceRefreshRow(RefreshInfo rowInfo);
        Task<InvokeResponse> ServiceInvokeMethod(InvokeRequest invokeInfo);
    }
}