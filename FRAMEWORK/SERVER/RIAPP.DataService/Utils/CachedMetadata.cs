using System;
using System.Collections.Generic;
using System.Linq;
using RIAPP.DataService.DomainService.Config;
using RIAPP.DataService.DomainService.Exceptions;
using RIAPP.DataService.DomainService.Interfaces;
using RIAPP.DataService.DomainService.Types;
using RIAPP.DataService.Resources;

namespace RIAPP.DataService.Utils
{
    public class CachedMetadata
    {
        private readonly Lazy<ILookup<Type, DbSetInfo>> _dbSetsByTypeLookUp;
        private readonly OperationalMethods _operMethods;
        private readonly MethodMap _svcMethods;


        public CachedMetadata()
        {
            ValidatorsContainer = new ValidatorContainer();
            DataManagerContainer = new DataManagerContainer();
            DataManagerContainer.RegisteredDM += _dataManagerContainer_RegisteredDM;
            _dbSetsByTypeLookUp =
                new Lazy<ILookup<Type, DbSetInfo>>(() => { return dbSets.Values.ToLookup(v => v.EntityType); }, true);
            _svcMethods = new MethodMap();
            _operMethods = new OperationalMethods();
        }

        internal ILookup<Type, DbSetInfo> dbSetsByTypeLookUp
        {
            get { return _dbSetsByTypeLookUp.Value; }
        }

        public DbSetsDictionary dbSets { get; } = new DbSetsDictionary();
        public AssociationsDictionary associations { get; } = new AssociationsDictionary();

        public MethodsList methodDescriptions
        {
            get { return new MethodsList(_svcMethods.Values); }
        }

        public IValidatorContainer ValidatorsContainer { get; }

        public IDataManagerContainer DataManagerContainer { get; }

        private void _dataManagerContainer_RegisteredDM(object sender, RegisteredDMEventArgs e)
        {
            if (RegisteredDM != null)
            {
                RegisteredDM(this, e);
            }
        }

        public event EventHandler<RegisteredDMEventArgs> RegisteredDM;

        internal void InitSvcMethods(MethodsList methods)
        {
            methods.ForEach(md =>
            {
                if (md.methodData.entityType != null)
                {
                    var dbSets = dbSetsByTypeLookUp[md.methodData.entityType];
                    foreach (var dbSetInfo in dbSets)
                    {
                        _svcMethods.Add(dbSetInfo.dbSetName, md);
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
                if (md.entityType != null)
                {
                    var dbSets = dbSetsByTypeLookUp[md.entityType];
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

        public MethodDescription GetInvokeMethod(string name)
        {
            var method = _svcMethods.GetInvokeMethod("", name);
            if (method == null)
            {
                throw new DomainServiceException(string.Format(ErrorStrings.ERR_METH_NAME_INVALID, name));
            }
            return method;
        }

        public MethodInfoData getOperationMethodInfo(string dbSetName, MethodType methodType)
        {
            var method = _operMethods.GetMethod(dbSetName, methodType);
            return method;
        }
    }
}