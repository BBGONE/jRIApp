using RIAPP.DataService.Annotations;
using RIAPP.DataService.Core.Exceptions;
using RIAPP.DataService.Core.Types;
using RIAPP.DataService.Resources;
using System;
using System.Collections.Generic;
using System.Linq;

namespace RIAPP.DataService.Core.Metadata
{
    public class RunTimeMetadata
    {
        private readonly Lazy<ILookup<Type, DbSetInfo>> _dbSetsByTypeLookUp;
        private readonly OperationalMethods _operMethods;
        private readonly MethodMap _svcMethods;

        public RunTimeMetadata()
        {
            DbSets = new DbSetsDictionary();
            Associations = new AssociationsDictionary();
            _dbSetsByTypeLookUp = new Lazy<ILookup<Type, DbSetInfo>>(() => { return DbSets.Values.ToLookup(v => v.GetEntityType()); }, true);
            _svcMethods = new MethodMap();
            _operMethods = new OperationalMethods();
        }

        public ILookup<Type, DbSetInfo> dbSetsByTypeLookUp
        {
            get { return _dbSetsByTypeLookUp.Value; }
        }

        internal void InitSvcMethods(MethodsList methods)
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
                        if (!this.DbSets.ContainsKey(dbSetName))
                            throw new DomainServiceException(string.Format("Can not determine the DbSet for a query method: {0} by DbSetName {1}", md.methodName, dbSetName));
                        _svcMethods.Add(dbSetName, md);
                    }
                    else
                    {
                        System.Type entityType = queryAttribute.EntityType ?? md.GetMethodData().EntityType;

                        IEnumerable<DbSetInfo> dbSets = dbSetsByTypeLookUp[entityType];
                        if (!dbSets.Any())
                        {
                            throw new DomainServiceException(string.Format("Can not determine the DbSet for a query method: {0}", md.methodName));
                        }

                        foreach (var dbSetInfo in dbSets)
                        {
                            _svcMethods.Add(dbSetInfo.dbSetName, md);
                        }
                    }
                }
                else
                {
                    _svcMethods.Add("", md);
                }
            });
        }

        internal void InitOperMethods(IEnumerable<MethodInfoData> methods)
        {
            var otherMethods = methods.ToArray();
            Array.ForEach(otherMethods, md =>
            {
                if (md.EntityType != null)
                {
                    var dbSets = dbSetsByTypeLookUp[md.EntityType];
                    foreach (var dbSetInfo in dbSets)
                    {
                        _operMethods.Add(dbSetInfo.dbSetName, md);
                    }
                }
                else
                {
                    _operMethods.Add("", md);
                }
            });
        }

        internal void InitCompleted()
        {
            _operMethods.MakeReadOnly();
            _svcMethods.MakeReadOnly();
        }

        public MethodDescription GetQueryMethod(string dbSetName, string name)
        {
            var method = _svcMethods.GetQueryMethod(dbSetName, name);
            if (method == null)
            {
                throw new DomainServiceException(string.Format(ErrorStrings.ERR_QUERY_NAME_INVALID, name));
            }
            return method;
        }

        public IEnumerable<MethodDescription> GetQueryMethods(string dbSetName)
        {
            return _svcMethods.GetQueryMethods(dbSetName);
        }

        public MethodDescription GetInvokeMethod(string name)
        {
            var method = _svcMethods.GetInvokeMethod(name);
            if (method == null)
            {
                throw new DomainServiceException(string.Format(ErrorStrings.ERR_METH_NAME_INVALID, name));
            }
            return method;
        }

        public IEnumerable<MethodDescription> GetInvokeMethods()
        {
           return _svcMethods.GetInvokeMethods();
        }

        public MethodInfoData GetOperationMethodInfo(string dbSetName, MethodType methodType)
        {
            var method = _operMethods.GetMethod(dbSetName, methodType);
            return method;
        }

        public DbSetsDictionary DbSets { get; }

        public AssociationsDictionary Associations { get; }

        public MethodsList MethodDescriptions
        {
            get { return new MethodsList(_svcMethods.Values); }
        }
    }
}