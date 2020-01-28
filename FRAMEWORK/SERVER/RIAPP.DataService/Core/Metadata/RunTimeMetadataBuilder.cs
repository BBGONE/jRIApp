﻿using RIAPP.DataService.Annotations;
using RIAPP.DataService.Core.CodeGen;
using RIAPP.DataService.Core.Exceptions;
using RIAPP.DataService.Core.Types;
using RIAPP.DataService.Resources;
using RIAPP.DataService.Utils;
using RIAPP.DataService.Utils.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;

namespace RIAPP.DataService.Core.Metadata
{
    public class RunTimeMetadataBuilder
    {
        private readonly Type domainServiceType;
        private readonly DesignTimeMetadata designTimeMetadata;
        private readonly IDataHelper dataHelper;
        private readonly IValueConverter valueConverter;
        private readonly IDataManagerContainer dataManagerContainer;

        public RunTimeMetadataBuilder(Type domainServiceType,
            DesignTimeMetadata designTimeMetadata,
            IDataHelper dataHelper,
            IValueConverter valueConverter,
            IDataManagerContainer dataManagerContainer)
        {
            this.domainServiceType = domainServiceType;
            this.designTimeMetadata = designTimeMetadata;
            this.dataHelper = dataHelper;
            this.valueConverter = valueConverter;
            this.dataManagerContainer = dataManagerContainer;
        }

        public RunTimeMetadata Build()
        {
            var dbSets = new DbSetsDictionary();

            foreach (DbSetInfo dbSetInfo in designTimeMetadata.DbSets)
            {
                dbSets.Add(dbSetInfo.dbSetName, dbSetInfo);
            }

            foreach (DbSetInfo dbSetInfo in dbSets.Values)
            {
                dbSetInfo.Initialize(dataHelper);
            }

            var dbSetsByTypeLookUp = dbSets.Values.ToLookup(v => v.GetEntityType());
            var svcMethods = new MethodMap();
            var operMethods = new OperationalMethods();

            foreach (var descriptor in dataManagerContainer.Descriptors)
            {
                ProcessMethodDescriptions(descriptor.ImplementationType, svcMethods, operMethods, dbSets, dbSetsByTypeLookUp);
            }

            ProcessMethodDescriptions(domainServiceType, svcMethods, operMethods, dbSets, dbSetsByTypeLookUp);

            operMethods.MakeReadOnly();
            svcMethods.MakeReadOnly();

            var associations = new AssociationsDictionary();

            foreach (Association assoc in designTimeMetadata.Associations)
            {
                ProcessAssociation(assoc, dbSets, associations);
            }

            return new RunTimeMetadata(dbSets, dbSetsByTypeLookUp, associations, svcMethods, operMethods, designTimeMetadata.TypeScriptImports.ToArray());
        }

        private static MethodType _GetMethodType(MethodInfo methodInfo, IEnumerable<MethodInfoData> dataManagerMethods)
        {
            if (dataManagerMethods != null)
            {
                var crudMethod = dataManagerMethods.FirstOrDefault(m => m.MethodInfo == methodInfo);
                if (crudMethod != null)
                {
                    return crudMethod.MethodType;
                }
            }

            if (methodInfo.IsDefined(typeof(QueryAttribute), false))
            {
                return MethodType.Query;
            }

            if (methodInfo.IsDefined(typeof(InvokeAttribute), false))
            {
                return MethodType.Invoke;
            }

            if (dataManagerMethods == null && methodInfo.IsDefined(typeof(InsertAttribute), false))
            {
                return MethodType.Insert;
            }

            if (dataManagerMethods == null && methodInfo.IsDefined(typeof(UpdateAttribute), false))
            {
                return MethodType.Update;
            }

            if (dataManagerMethods == null && methodInfo.IsDefined(typeof(DeleteAttribute), false))
            {
                return MethodType.Delete;
            }

            if (methodInfo.IsDefined(typeof(ValidateAttribute), false))
            {
                return MethodType.Validate;
            }

            if (methodInfo.IsDefined(typeof(RefreshAttribute), false))
            {
                return MethodType.Refresh;
            }

            return MethodType.None;
        }

        /// <summary>
        ///     Gets CRUD methods from DataManager which implements IDataManager<TModel> interface
        /// </summary>
        /// <param name="fromType"></param>
        /// <param name="intType"></param>
        /// <returns></returns>
        private static IEnumerable<MethodInfoData> _GetDataManagerCRUDMethods(Type fromType, Type modelType)
        {
            // removes duplicates of the method (there are could be synch and async methods)
            IDictionary<MethodType, MethodInfoData> methodTypes = new Dictionary<MethodType, MethodInfoData>();
            
            void AddMethodInfoData(MethodType methodType, MethodInfo methodInfo)
            {
                if (!methodTypes.ContainsKey(methodType) && methodInfo.GetParameters().FirstOrDefault()?.ParameterType == modelType)
                {
                    methodTypes.Add(methodType, new MethodInfoData
                    {
                        OwnerType = fromType,
                        MethodInfo = methodInfo,
                        MethodType = methodType,
                        IsInDataManager = true
                    });
                }
            };

            void AddMethod(MethodInfo method)
            {
                switch (method.Name)
                {
                    case "Insert":
                    case "InsertAsync":
                        AddMethodInfoData(MethodType.Insert, method);
                        break;
                    case "Update":
                    case "UpdateAsync":
                        AddMethodInfoData(MethodType.Update, method);
                        break;
                    case "Delete":
                    case "DeleteAsync":
                        AddMethodInfoData(MethodType.Delete, method);
                        break;
                }
            };

            var methods = fromType.GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly);

            foreach(var method in methods)
            {
                AddMethod(method);
            }

            return methodTypes.Values.ToArray();
        }

        private static IEnumerable<MethodInfoData> _GetAllMethods(Type fromType)
        {
            var methodInfos = fromType.GetMethods(BindingFlags.Instance | BindingFlags.DeclaredOnly | BindingFlags.Public);
            var interfTypes = fromType.GetInterfaces();
            var dataManagerInterface = interfTypes.Where(i =>
                        i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IDataManager<>) &&
                        i.GetGenericArguments().Count() == 1).FirstOrDefault();

            bool isDataManager = dataManagerInterface != null;
            IEnumerable<MethodInfoData> crudMethods = null;

            if (isDataManager)
            {
                Type modelType = dataManagerInterface.GetGenericArguments().First();
                crudMethods = _GetDataManagerCRUDMethods(fromType, modelType);
            }

            var allList = methodInfos.Select(m => new MethodInfoData
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
                            data.EntityType = data.MethodInfo.ReturnType.GetTaskResultType().GetGenericArguments().First();
                            break;
                        case MethodType.Invoke:
                            data.EntityType = null;
                            break;
                        case MethodType.Refresh:
                            data.EntityType = data.MethodInfo.ReturnType.GetTaskResultType();
                            break;
                        default:
                            data.EntityType = data.MethodInfo.GetParameters().First().ParameterType;
                            break;
                    }
                }
            });

            return allList;
        }

        private void ProcessMethodDescriptions(Type fromType, MethodMap svcMethods, OperationalMethods operMethods, DbSetsDictionary dbSets, ILookup<Type, DbSetInfo> dbSetsByTypeLookUp)
        {
            IEnumerable<MethodInfoData> allList = _GetAllMethods(fromType);

            InitSvcMethods(allList.GetSvcMethods(valueConverter), svcMethods, dbSets, dbSetsByTypeLookUp);

            var otherMethods = allList.GetOthersOnly();

            InitOperMethods(otherMethods, operMethods, dbSetsByTypeLookUp);
        }

        private void ProcessAssociation(Association assoc, DbSetsDictionary dbSets, AssociationsDictionary associations)
        {
            if (string.IsNullOrWhiteSpace(assoc.name))
            {
                throw new DomainServiceException(ErrorStrings.ERR_ASSOC_EMPTY_NAME);
            }
            if (!dbSets.ContainsKey(assoc.parentDbSetName))
            {
                throw new DomainServiceException(string.Format(ErrorStrings.ERR_ASSOC_INVALID_PARENT, assoc.name,
                    assoc.parentDbSetName));
            }
            if (!dbSets.ContainsKey(assoc.childDbSetName))
            {
                throw new DomainServiceException(string.Format(ErrorStrings.ERR_ASSOC_INVALID_CHILD, assoc.name,
                    assoc.childDbSetName));
            }

            var childDb = dbSets[assoc.childDbSetName];
            var parentDb = dbSets[assoc.parentDbSetName];
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
            associations.Add(assoc.name, assoc);

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
        }

        private void InitSvcMethods(MethodsList methods, MethodMap svcMethods, DbSetsDictionary dbSets, ILookup<Type, DbSetInfo> dbSetsByTypeLookUp)
        {
            methods.ForEach(md =>
            {
                if (md.isQuery)
                {
                    //First check QueryAtrribute if it contains info for Entity Type or DbSet Name
                    QueryAttribute queryAttribute = (QueryAttribute)md.GetMethodData().MethodInfo.GetCustomAttributes(typeof(QueryAttribute), false).FirstOrDefault();

                    string dbSetName = queryAttribute.DbSetName;
                    if (!string.IsNullOrWhiteSpace(dbSetName))
                    {
                        if (!dbSets.ContainsKey(dbSetName))
                        {
                            throw new DomainServiceException(string.Format("Can not determine the DbSet for a query method: {0} by DbSetName {1}", md.methodName, dbSetName));
                        }

                        svcMethods.Add(dbSetName, md);
                    }
                    else
                    {
                        System.Type entityType = queryAttribute.EntityType ?? md.GetMethodData().EntityType;

                        IEnumerable<DbSetInfo> entityTypeDbSets = dbSetsByTypeLookUp[entityType];
                        if (!entityTypeDbSets.Any())
                        {
                            throw new DomainServiceException(string.Format("Can not determine the DbSet for a query method: {0}", md.methodName));
                        }

                        foreach (var dbSetInfo in entityTypeDbSets)
                        {
                            svcMethods.Add(dbSetInfo.dbSetName, md);
                        }
                    }
                }
                else
                {
                    svcMethods.Add("", md);
                }
            });
        }

        private void InitOperMethods(IEnumerable<MethodInfoData> methods, OperationalMethods operMethods, ILookup<Type, DbSetInfo> dbSetsByTypeLookUp)
        {
            MethodInfoData[] otherMethods = methods.ToArray();

            Array.ForEach(otherMethods, md =>
            {
                if (md.EntityType != null)
                {
                    var dbSets = dbSetsByTypeLookUp[md.EntityType];

                    foreach (var dbSetInfo in dbSets)
                    {
                        operMethods.Add(dbSetInfo.dbSetName, md);
                    }
                }
                else
                {
                    operMethods.Add("", md);
                }
            });
        }
    }
}