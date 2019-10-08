using RIAPP.DataService.Annotations;
using RIAPP.DataService.Core.CodeGen;
using RIAPP.DataService.Core.Exceptions;
using RIAPP.DataService.Core.Types;
using RIAPP.DataService.Resources;
using RIAPP.DataService.Utils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace RIAPP.DataService.Core.Metadata
{

    public static class MetadataHelper
    {
        private static readonly MetadataCache _metadataCache = new MetadataCache();

        public static RunTimeMetadata GetInitializedMetadata(BaseDomainService domainService, 
            IDataHelper dataHelper, 
            IValueConverter valueConverter)
        {
            RunTimeMetadata result = _metadataCache.GetOrAdd(domainService.GetType(), (svcType) => {
                RunTimeMetadata runTimeMetadata = null;
                try
                {
                    DesignTimeMetadata designTimeMetadata = ((IMetaDataProvider)domainService).GetDesignTimeMetadata(false);
                    IDataManagerContainer dataManagerContainer = domainService.ServiceContainer.DataManagerContainer;
                    runTimeMetadata = InitMetadata(domainService, designTimeMetadata, dataHelper, valueConverter, dataManagerContainer);
                }
                catch (Exception ex)
                {
                    domainService._OnError(ex);
                    throw new DummyException(ex.Message, ex);
                }
                return runTimeMetadata;
            });

            return result;
        }

        private static RunTimeMetadata InitMetadata(BaseDomainService domainService,
            DesignTimeMetadata designTimeMetadata,
            IDataHelper dataHelper, 
            IValueConverter valueConverter,
            IDataManagerContainer dataManagerContainer)
        {
            RunTimeMetadata runTimeMetadata = new RunTimeMetadata();

            // called on every data manager registered while bootstrapping
            try
            {
                InitCachedMetadata(domainService.GetType(), designTimeMetadata, runTimeMetadata, dataHelper, valueConverter, dataManagerContainer);
            }
            catch (Exception ex)
            {
                domainService._OnError(ex);
                throw new DummyException(ex.Message, ex);
            }
            finally
            {
                runTimeMetadata.InitCompleted();
            }

            return runTimeMetadata;
        }

        private static void InitCachedMetadata(Type domainServiceType, 
            DesignTimeMetadata designTimeMetadata, 
            RunTimeMetadata runTimeMetadata,
            IDataHelper dataHelper, 
            IValueConverter valueConverter, 
            IDataManagerContainer dataManagerContainer)
        {
            foreach (DbSetInfo dbSetInfo in designTimeMetadata.DbSets)
            {
                // indexed by dbSetName
                runTimeMetadata.DbSets.Add(dbSetInfo.dbSetName, dbSetInfo);
            }

            foreach (DbSetInfo dbSetInfo in runTimeMetadata.DbSets.Values)
            {
                dbSetInfo.Initialize(dataHelper);
            }

            foreach(var descriptor in dataManagerContainer.Descriptors)
            {
                ProcessMethodDescriptions(descriptor.ImplementationType, runTimeMetadata, valueConverter);
            }

            ProcessMethodDescriptions(domainServiceType, runTimeMetadata, valueConverter);

            foreach (var assoc in designTimeMetadata.Associations)
            {
                if (string.IsNullOrWhiteSpace(assoc.name))
                {
                    throw new DomainServiceException(ErrorStrings.ERR_ASSOC_EMPTY_NAME);
                }
                if (!runTimeMetadata.DbSets.ContainsKey(assoc.parentDbSetName))
                {
                    throw new DomainServiceException(string.Format(ErrorStrings.ERR_ASSOC_INVALID_PARENT, assoc.name,
                        assoc.parentDbSetName));
                }
                if (!runTimeMetadata.DbSets.ContainsKey(assoc.childDbSetName))
                {
                    throw new DomainServiceException(string.Format(ErrorStrings.ERR_ASSOC_INVALID_CHILD, assoc.name,
                        assoc.childDbSetName));
                }
                var childDb = runTimeMetadata.DbSets[assoc.childDbSetName];
                var parentDb = runTimeMetadata.DbSets[assoc.parentDbSetName];
                var parentDbFields = parentDb.GetFieldByNames();
                var childDbFields = childDb.GetFieldByNames();

                //check navigation field
                //dont allow to define  it explicitly, the association adds the field by itself (implicitly)
                if (!string.IsNullOrEmpty(assoc.childToParentName) && childDbFields.ContainsKey(assoc.childToParentName))
                {
                    throw new DomainServiceException(string.Format(ErrorStrings.ERR_ASSOC_INVALID_NAV_FIELD, assoc.name,
                        assoc.childToParentName));
                }

                //check navigation field
                //dont allow to define  it explicitly, the association adds the field by itself (implicitly)
                if (!string.IsNullOrEmpty(assoc.parentToChildrenName) &&
                    parentDbFields.ContainsKey(assoc.parentToChildrenName))
                {
                    throw new DomainServiceException(string.Format(ErrorStrings.ERR_ASSOC_INVALID_NAV_FIELD, assoc.name,
                        assoc.parentToChildrenName));
                }

                if (!string.IsNullOrEmpty(assoc.parentToChildrenName) && !string.IsNullOrEmpty(assoc.childToParentName) &&
                    assoc.childToParentName == assoc.parentToChildrenName)
                {
                    throw new DomainServiceException(string.Format(ErrorStrings.ERR_ASSOC_INVALID_NAV_FIELD, assoc.name,
                        assoc.parentToChildrenName));
                }

                foreach (var frel in assoc.fieldRels)
                {
                    if (!parentDbFields.ContainsKey(frel.parentField))
                    {
                        throw new DomainServiceException(string.Format(ErrorStrings.ERR_ASSOC_INVALID_PARENT_FIELD,
                            assoc.name, frel.parentField));
                    }
                    if (!childDbFields.ContainsKey(frel.childField))
                    {
                        throw new DomainServiceException(string.Format(ErrorStrings.ERR_ASSOC_INVALID_CHILD_FIELD,
                            assoc.name, frel.childField));
                    }
                }
                //indexed by Name
                runTimeMetadata.Associations.Add(assoc.name, assoc);

                if (!string.IsNullOrEmpty(assoc.childToParentName))
                {
                    var sb = new StringBuilder(120);
                    var dependentOn =
                        assoc.fieldRels.Aggregate(sb, (a, b) => a.Append((a.Length == 0 ? "" : ",") + b.childField),
                            a => a).ToString();
                    //add navigation field to dbSet's field collection
                    var fld = new Field
                    {
                        fieldName = assoc.childToParentName,
                        fieldType = FieldType.Navigation,
                        dataType = DataType.None,
                        dependentOn = dependentOn
                    };
                    fld.SetTypeScriptDataType(TypeScriptHelper.GetEntityInterfaceName(parentDb.dbSetName));
                    childDb.fieldInfos.Add(fld);
                }

                if (!string.IsNullOrEmpty(assoc.parentToChildrenName))
                {
                    var sb = new StringBuilder(120);
                    var fld = new Field
                    {
                        fieldName = assoc.parentToChildrenName,
                        fieldType = FieldType.Navigation,
                        dataType = DataType.None
                    };
                    fld.SetTypeScriptDataType($"{TypeScriptHelper.GetEntityInterfaceName(childDb.dbSetName)}[]");
                    //add navigation field to dbSet's field collection
                    parentDb.fieldInfos.Add(fld);
                }
            } //foreach (var assoc in metadata.Associations)
        }

        private static MethodType _GetMethodType(MethodInfo methodInfo, IEnumerable<MethodInfoData> crudMethods)
        {
            if (crudMethods != null)
            {
                var crudMethod = crudMethods.FirstOrDefault(m => m.MethodInfo == methodInfo);
                if (crudMethod != null)
                    return crudMethod.MethodType;
            }

            if (methodInfo.IsDefined(typeof(QueryAttribute), false))
                return MethodType.Query;
            if (methodInfo.IsDefined(typeof(InvokeAttribute), false))
                return MethodType.Invoke;
            if (crudMethods == null && methodInfo.IsDefined(typeof(InsertAttribute), false))
                return MethodType.Insert;
            if (crudMethods == null && methodInfo.IsDefined(typeof(UpdateAttribute), false))
                return MethodType.Update;
            if (crudMethods == null && methodInfo.IsDefined(typeof(DeleteAttribute), false))
                return MethodType.Delete;
            if (methodInfo.IsDefined(typeof(ValidateAttribute), false))
                return MethodType.Validate;
            if (methodInfo.IsDefined(typeof(RefreshAttribute), false))
                return MethodType.Refresh;
            return MethodType.None;
        }

        /// <summary>
        ///     Get CRUD methods from DataManager which implements IDataManager<TModel> interface
        /// </summary>
        /// <param name="fromType"></param>
        /// <param name="intType"></param>
        /// <returns></returns>
        private static IEnumerable<MethodInfoData> _GetCRUDMethods(Type fromType, Type intType)
        {
            var list = new List<MethodInfoData>();
            var map = fromType.GetInterfaceMap(intType);
            for (var ctr = 0; ctr < map.InterfaceMethods.Length; ctr++)
            {
                var im = map.InterfaceMethods[ctr];
                var tm = map.TargetMethods[ctr];
                bool isDeclaring = tm.DeclaringType == fromType;
                if (isDeclaring)
                {
                    switch (im.Name)
                    {
                        case "Insert":
                            list.Add(new MethodInfoData
                            {
                                OwnerType = fromType,
                                MethodInfo = tm,
                                MethodType = MethodType.Insert,
                                IsInDataManager = true
                            });
                            break;
                        case "Update":
                            list.Add(new MethodInfoData
                            {
                                OwnerType = fromType,
                                MethodInfo = tm,
                                MethodType = MethodType.Update,
                                IsInDataManager = true
                            });
                            break;
                        case "Delete":
                            list.Add(new MethodInfoData
                            {
                                OwnerType = fromType,
                                MethodInfo = tm,
                                MethodType = MethodType.Delete,
                                IsInDataManager = true
                            });
                            break;
                    }
                }
            }

            return list;
        }

        private static IEnumerable<MethodInfoData> GetAllMethods(Type fromType)
        {
            var methodInfos = fromType.GetMethods(BindingFlags.Instance | BindingFlags.DeclaredOnly | BindingFlags.Public);
            var interfTypes = fromType.GetInterfaces();
            var dataManagerInterface = interfTypes.Where(i =>
                        i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IDataManager<>) &&
                        i.GetGenericArguments().Count() == 1).FirstOrDefault();
            bool isDataManager = dataManagerInterface != null;
            IEnumerable<MethodInfoData> crudMethods = null;
            if (isDataManager)
                crudMethods = _GetCRUDMethods(fromType, dataManagerInterface);

            var allList = methodInfos.Select(m =>
                        new MethodInfoData
                        {
                            OwnerType = fromType,
                            MethodInfo = m,
                            MethodType = _GetMethodType(m, crudMethods),
                            IsInDataManager = isDataManager
                        }).Where(m => m.MethodType != MethodType.None).ToArray();

            Array.ForEach(allList, data =>
            {
                if (isDataManager)
                {
                    data.EntityType = dataManagerInterface.GetGenericArguments().First();
                }
                else
                {
                    switch (data.MethodType)
                    {
                        case MethodType.Query:
                            data.EntityType = GetTaskResultType(data.MethodInfo.ReturnType).GetGenericArguments().First();
                            break;
                        case MethodType.Invoke:
                            data.EntityType = null;
                            break;
                        case MethodType.Refresh:
                            data.EntityType = GetTaskResultType(data.MethodInfo.ReturnType);
                            break;
                        default:
                            data.EntityType = data.MethodInfo.GetParameters().First().ParameterType;
                            break;
                    }
                }
            });

            return allList;
        }

        private static MethodsList GetSvcMethods(IEnumerable<MethodInfoData> allList, IValueConverter valueConverter)
        {
            var queryAndInvokes = allList.GetQueryAndInvokeOnly().ToArray();
            var methodList = new MethodsList();
            Array.ForEach(queryAndInvokes, info =>
            {
                var methodDescription = MethodDescription.FromMethodInfo(info, valueConverter);
                methodList.Add(methodDescription);
            });
            return methodList;
        }

        /// <summary>
        ///     Test if public methods on the service has Invoke or Query Attribute
        ///     and generates from this methods their invocation method descriptions
        /// </summary>
        /// <returns></returns>
        private static void ProcessMethodDescriptions(Type fromType, RunTimeMetadata metadata, IValueConverter valueConverter)
        {
            var allList = GetAllMethods(fromType);
            var svcMethods = GetSvcMethods(allList, valueConverter);
            metadata.InitSvcMethods(svcMethods);

            var otherMethods = allList.GetOthersOnly();
            metadata.InitOperMethods(otherMethods);
        }

        /// <summary>
        ///     If the type is Task<InnerType>
        ///     then the method return type of InnerType removing Task type
        /// </summary>
        /// <param name="type"></param>
        /// <returns></returns>
        public static Type GetTaskResultType(Type type)
        {
            if (type.IsGenericType && typeof(Task).IsAssignableFrom(type))
            {
                return type.GetGenericArguments().First();
            }
            return type;
        }
    }
}