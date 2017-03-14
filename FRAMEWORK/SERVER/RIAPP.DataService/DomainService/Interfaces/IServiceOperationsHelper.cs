using System;
using System.Threading.Tasks;
using RIAPP.DataService.DomainService.Types;
using RIAPP.DataService.Utils;

namespace RIAPP.DataService.DomainService.Interfaces
{
    public interface IServiceOperationsHelper
    {
        Task AfterExecuteChangeSet();
        void ApplyValues(object entity, RowInfo rowInfo, string path, ValueChange[] values, bool isOriginal);
        void CheckValuesChanges(RowInfo rowInfo, string path, ValueChange[] values);
        void DeleteEntity(CachedMetadata metadata, RowInfo rowInfo);
        object GetMethodOwner(MethodInfoData methodData);
        object GetOriginalEntity(RowInfo rowInfo);
        object GetOriginalEntity(object entity, RowInfo rowInfo);
        T GetOriginalEntity<T>(RowInfo rowInfo) where T : class;
        object GetParentEntity(Type entityType, RowInfo rowInfo);
        T GetParentEntity<T>(RowInfo rowInfo) where T : class;
        void InsertEntity(CachedMetadata metadata, RowInfo rowInfo);
        bool isEntityValueChanged(RowInfo rowInfo, string fullName, Field fieldInfo, out string newVal);
        void UpdateEntity(CachedMetadata metadata, RowInfo rowInfo);
        void UpdateEntityFromRowInfo(object entity, RowInfo rowInfo, bool isOriginal);
        void UpdateRowInfoAfterUpdates(RowInfo rowInfo);
        void UpdateRowInfoFromEntity(object entity, RowInfo rowInfo);
        void UpdateValuesFromEntity(object entity, string path, DbSetInfo dbSetInfo, ValueChange[] values);
        Task<bool> ValidateEntity(CachedMetadata metadata, RequestContext requestContext);

        Task<object> GetMethodResult(object invokeRes);
    }
}