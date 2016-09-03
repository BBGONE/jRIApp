using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using RIAPP.DataService.DomainService;
using RIAPP.DataService.DomainService.Attributes;
using RIAPP.DataService.DomainService.Config;
using RIAPP.DataService.DomainService.Exceptions;
using RIAPP.DataService.DomainService.Interfaces;
using RIAPP.DataService.DomainService.Types;
using RIAPP.DataService.Resources;
using RIAPP.DataService.Utils.CodeGen;
using RIAPP.DataService.Utils.Extensions;
using RIAPP.DataService.Utils.STAThreadSync;

namespace RIAPP.DataService.Utils
{
    public static class MetadataHelper
    {
        private static readonly StaSynchronizationContext _synchronizer = new StaSynchronizationContext();
        private static readonly MetadataCache _metadataCache = new MetadataCache();

        public static CachedMetadata EnsureMetadataInitialized(BaseDomainService domainService)
        {
            CachedMetadata cachedMetadata = null;
            Func<CachedMetadata> factory = () =>
            {
                var thisType = domainService.GetType();
                CachedMetadata result = null;
                if (_metadataCache.TryGetValue(thisType, out result))
                    return result;
                ExecuteOnSTA(state =>
                {
                    try
                    {
                        InitMetadata((BaseDomainService) state);
                    }
                    catch (Exception ex)
                    {
                        domainService._OnError(ex);
                        throw new DummyException(ex.Message, ex);
                    }
                }, domainService);
                _metadataCache.TryGetValue(thisType, out result);
                return result;
            };
            LazyInitializer.EnsureInitialized(ref cachedMetadata, factory);
            return cachedMetadata;
        }

        public static void ExecuteOnSTA(SendOrPostCallback action, object state)
        {
            _synchronizer.Send(action, state);
        }

        private static void InitMetadata(BaseDomainService domainService)
        {
            var thisType = domainService.GetType();
            CachedMetadata cachedMetadata = null;
            if (_metadataCache.TryGetValue(thisType, out cachedMetadata))
            {
                return;
            }
            EventHandler<RegisteredDMEventArgs> fn_regDM =
                (sender, e) =>
                {
                    ProcessMethodDescriptions(domainService.ServiceContainer, e.DataManagerType, (CachedMetadata) sender);
                };
            cachedMetadata = new CachedMetadata();
            //called on every data manager registered while bootstrapping
            cachedMetadata.RegisteredDM += fn_regDM;
            try
            {
                InitCachedMetadata(domainService, cachedMetadata);
            }
            catch (Exception ex)
            {
                domainService._OnError(ex);
                throw new DummyException(ex.Message, ex);
            }
            finally
            {
                cachedMetadata.RegisteredDM -= fn_regDM;
                cachedMetadata.InitCompleted();
            }
            _metadataCache.TryAdd(thisType, cachedMetadata);
        }

        private static void InitCachedMetadata(BaseDomainService domainService, CachedMetadata cachedMetadata)
        {
            var metadata = domainService.GetMetadata(false);

            foreach (var dbSetInfo in metadata.DbSets)
            {
                dbSetInfo.Initialize(domainService.ServiceContainer);
                //indexed by dbSetName
                cachedMetadata.dbSets.Add(dbSetInfo.dbSetName, dbSetInfo);
            }
            //bootstrapping
            domainService.Bootstrap(new ServiceConfig(cachedMetadata));

            ProcessMethodDescriptions(domainService.ServiceContainer, domainService.GetType(), cachedMetadata);

            foreach (var assoc in metadata.Associations)
            {
                if (string.IsNullOrWhiteSpace(assoc.name))
                {
                    throw new DomainServiceException(ErrorStrings.ERR_ASSOC_EMPTY_NAME);
                }
                if (!cachedMetadata.dbSets.ContainsKey(assoc.parentDbSetName))
                {
                    throw new DomainServiceException(string.Format(ErrorStrings.ERR_ASSOC_INVALID_PARENT, assoc.name,
                        assoc.parentDbSetName));
                }
                if (!cachedMetadata.dbSets.ContainsKey(assoc.childDbSetName))
                {
                    throw new DomainServiceException(string.Format(ErrorStrings.ERR_ASSOC_INVALID_CHILD, assoc.name,
                        assoc.childDbSetName));
                }
                var childDb = cachedMetadata.dbSets[assoc.childDbSetName];
                var parentDb = cachedMetadata.dbSets[assoc.parentDbSetName];
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
                cachedMetadata.associations.Add(assoc.name, assoc);

                if (!string.IsNullOrEmpty(assoc.childToParentName))
                {
                    var sb = new StringBuilder(120);
                    var dependentOn =
                        assoc.fieldRels.Aggregate(sb, (a, b) => a.Append((a.Length == 0 ? "" : ",") + b.childField),
                            a => a).ToString();
                    //add navigation field to dbSet's field collection
                    childDb.fieldInfos.Add(new Field
                    {
                        fieldName = assoc.childToParentName,
                        fieldType = FieldType.Navigation,
                        dataType = DataType.None,
                        dependentOn = dependentOn,
                        _TypeScriptDataType = TypeScriptHelper.GetEntityInterfaceName(parentDb.dbSetName)
                    });
                }

                if (!string.IsNullOrEmpty(assoc.parentToChildrenName))
                {
                    var sb = new StringBuilder(120);
                    //add navigation field to dbSet's field collection
                    parentDb.fieldInfos.Add(new Field
                    {
                        fieldName = assoc.parentToChildrenName,
                        fieldType = FieldType.Navigation,
                        dataType = DataType.None,
                        _TypeScriptDataType = string.Format("{0}[]", TypeScriptHelper.GetEntityInterfaceName(childDb.dbSetName))
                    });
                }
            } //foreach (var assoc in metadata.Associations)
        }


        private static MethodType fn_getMethodType(MethodInfo methodInfo, IEnumerable<MethodInfoData> crudMethods)
        {
            if (crudMethods != null)
            {
                var crudMethod = crudMethods.FirstOrDefault(m => m.methodInfo == methodInfo);
                if (crudMethod != null)
                    return crudMethod.methodType;
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
        ///     Get CRUD methods from dataManager which implements IDataManager<TModel> interface
        /// </summary>
        /// <param name="fromType"></param>
        /// <param name="intType"></param>
        /// <returns></returns>
        private static IEnumerable<MethodInfoData> fn_getCRUDMethods(Type fromType, Type intType)
        {
            var list = new List<MethodInfoData>();
            var map = fromType.GetInterfaceMap(intType);
            for (var ctr = 0; ctr < map.InterfaceMethods.Length; ctr++)
            {
                var im = map.InterfaceMethods[ctr];
                var tm = map.TargetMethods[ctr];
                var isDeclaring = tm.DeclaringType == fromType;
                if (isDeclaring)
                {
                    switch (im.Name)
                    {
                        case "Insert":
                            list.Add(new MethodInfoData
                            {
                                ownerType = fromType,
                                methodInfo = tm,
                                methodType = MethodType.Insert,
                                isInDataManager = true
                            });
                            break;
                        case "Update":
                            list.Add(new MethodInfoData
                            {
                                ownerType = fromType,
                                methodInfo = tm,
                                methodType = MethodType.Update,
                                isInDataManager = true
                            });
                            break;
                        case "Delete":
                            list.Add(new MethodInfoData
                            {
                                ownerType = fromType,
                                methodInfo = tm,
                                methodType = MethodType.Delete,
                                isInDataManager = true
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
            var dataManagerInterface =
                interfTypes.Where(
                    i =>
                        i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IDataManager<>) &&
                        i.GetGenericArguments().Count() == 1).FirstOrDefault();
            var isDataManager = dataManagerInterface != null;
            IEnumerable<MethodInfoData> crudMethods = null;
            if (isDataManager)
                crudMethods = fn_getCRUDMethods(fromType, dataManagerInterface);

            var allList = methodInfos.Select(
                    m =>
                        new MethodInfoData
                        {
                            ownerType = fromType,
                            methodInfo = m,
                            methodType = fn_getMethodType(m, crudMethods),
                            isInDataManager = isDataManager
                        }).Where(m => m.methodType != MethodType.None).ToArray();

            Array.ForEach(allList, data =>
            {
                if (isDataManager)
                {
                    data.entityType = dataManagerInterface.GetGenericArguments().First();
                }
                else
                {
                    switch (data.methodType)
                    {
                        case MethodType.Query:
                            data.entityType = RemoveTaskFromType(data.methodInfo.ReturnType).GetGenericArguments().First();
                            break;
                        case MethodType.Invoke:
                            data.entityType = null;
                            break;
                        case MethodType.Refresh:
                            data.entityType = RemoveTaskFromType(data.methodInfo.ReturnType);
                            break;
                        default:
                            data.entityType = data.methodInfo.GetParameters().First().ParameterType;
                            break;
                    }
                }
            });

            return allList;
        }

        private static MethodsList GetSvcMethods(IEnumerable<MethodInfoData> allList, IServiceContainer services)
        {
            var queryAndInvokes = allList.GetQueryAndInvokeOnly().ToArray();
            var methodList = new MethodsList();
            Array.ForEach(queryAndInvokes, info =>
            {
                var m = MethodDescription.FromMethodInfo(info, services);
                methodList.Add(m);
            });
            return methodList;
        }

        /// <summary>
        ///     Test if public methods on the service has Invoke or Query Attribute
        ///     and generates from this methods their invocation method descriptions
        /// </summary>
        /// <returns></returns>
        private static void ProcessMethodDescriptions(IServiceContainer services, Type fromType, CachedMetadata metadata)
        {
            var allList = GetAllMethods(fromType);
            var svcMethods = GetSvcMethods(allList, services);
            metadata.InitSvcMethods(svcMethods);

            var otherMethods = allList.GetOthersOnly();
            metadata.InitOperMethods(otherMethods);
        }

        /// <summary>
        ///     if the type is Task
        ///     <InnerType>
        ///         the method return type of InnerType removing Task type
        /// </summary>
        /// <param name="type"></param>
        /// <returns></returns>
        public static Type RemoveTaskFromType(Type type)
        {
            if (type.IsGenericType && typeof(Task).IsAssignableFrom(type))
            {
                return type.GetGenericArguments().First();
            }
            return type;
        }
    }
}