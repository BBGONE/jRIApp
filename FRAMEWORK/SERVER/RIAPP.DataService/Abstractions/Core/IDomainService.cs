using RIAPP.DataService.Core.CodeGen;
using RIAPP.DataService.Core.Metadata;
using RIAPP.DataService.Core.Types;
using System;
using System.Threading.Tasks;

namespace RIAPP.DataService.Core
{
    public interface IDomainService : IDisposable
    {
        // provides differnt code generations implemented by providers (csharp, xaml, typescvript etc.)
        string ServiceCodeGen(CodeGenArgs args);

        // information about permissions to execute service operations for the client
        Task<Permissions> ServiceGetPermissions();
        // information about service methods, DbSets and their fields information
        MetadataResult ServiceGetMetadata();

        Task<QueryResponse> ServiceGetData(QueryRequest request);
        Task<ChangeSetResponse> ServiceApplyChangeSet(ChangeSetRequest changeSet);
        Task<RefreshResponse> ServiceRefreshRow(RefreshRequest rowInfo);
        Task<InvokeResponse> ServiceInvokeMethod(InvokeRequest invokeInfo);
    }
}