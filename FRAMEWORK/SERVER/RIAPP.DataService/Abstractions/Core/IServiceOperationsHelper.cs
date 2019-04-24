﻿using RIAPP.DataService.Core.Metadata;
using RIAPP.DataService.Core.Types;
using System;
using System.Threading.Tasks;

namespace RIAPP.DataService.Core
{
    public interface IServiceOperationsHelper
    {
        Task AfterExecuteChangeSet();
        void ApplyValues(object entity, RowInfo rowInfo, string path, ValueChange[] values, bool isOriginal);
        void CheckValuesChanges(RowInfo rowInfo, string path, ValueChange[] values);
        void DeleteEntity(RunTimeMetadata metadata, RowInfo rowInfo);
        object GetMethodOwner(MethodInfoData methodData);
        object GetOriginalEntity(RowInfo rowInfo);
        object GetOriginalEntity(object entity, RowInfo rowInfo);
        T GetOriginalEntity<T>(RowInfo rowInfo) where T : class;
        object GetParentEntity(Type entityType, RowInfo rowInfo);
        T GetParentEntity<T>(RowInfo rowInfo) where T : class;
        void InsertEntity(RunTimeMetadata metadata, RowInfo rowInfo);
        bool isEntityValueChanged(RowInfo rowInfo, string fullName, Field fieldInfo, out string newVal);
        void UpdateEntity(RunTimeMetadata metadata, RowInfo rowInfo);
        void UpdateEntityFromRowInfo(object entity, RowInfo rowInfo, bool isOriginal);
        void UpdateRowInfoAfterUpdates(RowInfo rowInfo);
        void UpdateRowInfoFromEntity(object entity, RowInfo rowInfo);
        void UpdateValuesFromEntity(object entity, string path, DbSetInfo dbSetInfo, ValueChange[] values);
        Task<bool> ValidateEntity(RunTimeMetadata metadata, RequestContext requestContext);

        Task<object> GetMethodResult(object invokeRes);
    }

    public interface IServiceOperationsHelper<TService>: IServiceOperationsHelper
        where TService : BaseDomainService
    {

    }
}