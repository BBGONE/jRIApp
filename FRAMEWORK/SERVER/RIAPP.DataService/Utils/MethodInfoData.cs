using System;
using System.Reflection;
using RIAPP.DataService.DomainService.Types;

namespace RIAPP.DataService.Utils
{
    public class MethodInfoData
    {
        public Type entityType;

        /// <summary>
        ///     if this method is implemented in data manager instead of the data service
        /// </summary>
        public bool isInDataManager;

        public MethodInfo methodInfo;
        //is it a query, insert, update ... method?
        public MethodType methodType;
        public Type ownerType;
    }
}