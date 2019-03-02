using RIAPP.DataService.DomainService.Types;
using System;
using System.Reflection;

namespace RIAPP.DataService.DomainService.Metadata
{
    public class MethodInfoData
    {
        public Type EntityType;

        /// <summary>
        ///  if this method is implemented in a data manager instead of the data service
        /// </summary>
        public bool IsInDataManager;

        public MethodInfo MethodInfo;
        // is it a query, insert, update ... method?
        public MethodType MethodType;

        public Type OwnerType;
    }
}