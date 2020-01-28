using RIAPP.DataService.Core.Metadata;
using RIAPP.DataService.Core.Types;
using RIAPP.DataService.Utils;
using System;
using System.Threading.Tasks;

namespace RIAPP.DataService.Core
{
    public interface IServiceOperationsHelper
    {
        IDataHelper DataHelper { get; }

        IValidationHelper ValidationHelper { get; }

        Task AfterExecuteChangeSet(ChangeSetRequest message);

        Task AfterChangeSetCommited(ChangeSetRequest changeSet, SubResultList refreshResult);

        void ApplyValues(object entity, RowInfo rowInfo, string path, ValueChange[] values, bool isOriginal);
        void CheckValuesChanges(RowInfo rowInfo, string path, ValueChange[] values);
        Task DeleteEntity(RunTimeMetadata metadata, RowInfo rowInfo);
        object GetMethodOwner(MethodInfoData methodData);
        object GetOriginalEntity(RowInfo rowInfo);
        object GetOriginalEntity(object entity, RowInfo rowInfo);
        T GetOriginalEntity<T>(RowInfo rowInfo) where T : class;
        object GetParentEntity(Type entityType, RowInfo rowInfo);
        T GetParentEntity<T>(RowInfo rowInfo) where T : class;
        Task InsertEntity(RunTimeMetadata metadata, RowInfo rowInfo);
        bool isEntityValueChanged(RowInfo rowInfo, string fullName, Field fieldInfo, out string newVal);
        Task UpdateEntity(RunTimeMetadata metadata, RowInfo rowInfo);
        void UpdateEntityFromRowInfo(object entity, RowInfo rowInfo, bool isOriginal);
        void UpdateRowInfoAfterUpdates(RowInfo rowInfo);
        void UpdateRowInfoFromEntity(object entity, RowInfo rowInfo);
        void UpdateValuesFromEntity(object entity, string path, DbSetInfo dbSetInfo, ValueChange[] values);
        Task<bool> ValidateEntity(RunTimeMetadata metadata, RequestContext requestContext);

        Task<object> GetMethodResult(object invokeRes);
    }

    public interface IServiceOperationsHelper<TService> : IServiceOperationsHelper
        where TService : BaseDomainService
    {

    }
}