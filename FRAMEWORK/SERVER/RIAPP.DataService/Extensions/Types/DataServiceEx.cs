using System;
using System.Collections.Generic;

namespace RIAPP.DataService.Core.Types
{
    public static class DataServiceEx
    {
        public static IEnumerable<DbSetInfo> GetSetInfosByEntityType(this IDataServiceComponent component, Type entityType)
        {
            var metadata = component.DataService.GetMetadata();
            return metadata.dbSetsByTypeLookUp[entityType];
        }
    }
}