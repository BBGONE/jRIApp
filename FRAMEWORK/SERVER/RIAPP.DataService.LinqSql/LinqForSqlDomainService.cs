﻿using Microsoft.Extensions.DependencyInjection;
using RIAPP.DataService.DomainService;
using RIAPP.DataService.DomainService.Config;
using RIAPP.DataService.DomainService.Interfaces;
using RIAPP.DataService.DomainService.Types;
using RIAPP.DataService.LinqSql.Utils;
using RIAPP.DataService.Utils;
using RIAPP.DataService.Utils.Interfaces;
using System;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using System.Transactions;

namespace RIAPP.DataService.LinqSql
{
    public abstract class LinqForSqlDomainService<TDB> : BaseDomainService
        where TDB : System.Data.Linq.DataContext
    {
        private TDB _db;
        private bool _ownsDb = false;

        public LinqForSqlDomainService(TDB db, Action<IServiceOptions> args)
            :base(args)
        {
            this._db = db;
        }

        public LinqForSqlDomainService(Action<IServiceOptions> args)
            : this(null,args)
        {
           
        }

        #region Overridable Methods
        protected override void ConfigureCodeGen(CodeGenConfig config)
        {
            base.ConfigureCodeGen(config);
            config.AddOrReplaceCodeGen("csharp", () => new CsharpProvider<TDB>(this));
        }

        protected override void ConfigureServices(IServiceCollection services)
        {
            base.ConfigureServices(services);
            ServiceDescriptor[] toRemove = services.Where(sd => sd.ServiceType == typeof(IValueConverter)).ToArray();
            Array.ForEach(toRemove, sd => services.Remove(sd));
            //replace with another service
            services.AddSingleton<IValueConverter, LinqValueConverter>();
        }

        protected virtual TDB CreateDataContext() {
            return Activator.CreateInstance<TDB>();
        }

        protected override Metadata GetMetadata(bool isDraft)
        {
            Metadata metadata = new Metadata();
            PropertyInfo[] dbsetPropList = this.DB.GetType().GetProperties().Where(p => p.PropertyType.IsGenericType && p.PropertyType.GetGenericTypeDefinition() == typeof(System.Data.Linq.Table<>)).ToArray();
            Array.ForEach(dbsetPropList, (propInfo) =>
            {
                Type entityType = propInfo.PropertyType.GetGenericArguments().First();
                DbSetInfo dbSetInfo = new DbSetInfo()
                {
                    dbSetName = entityType.Name,
                    EntityType = entityType
                };
                metadata.DbSets.Add(dbSetInfo);
                PropertyInfo[] fieldPropList = entityType.GetProperties().Where(p => p.IsDefined(typeof(System.Data.Linq.Mapping.ColumnAttribute), false)).ToArray();
                short pkNum = 0;
                Array.ForEach(fieldPropList, (propInfo2) =>
                {
                    Field fieldInfo = new Field();
                    fieldInfo.fieldName = propInfo2.Name;
                    var colAttr = (System.Data.Linq.Mapping.ColumnAttribute)propInfo2.GetCustomAttributes(typeof(System.Data.Linq.Mapping.ColumnAttribute), false).First();
                    fieldInfo.isAutoGenerated = colAttr.IsDbGenerated;
                    if (colAttr.IsPrimaryKey)
                    {
                        fieldInfo.isPrimaryKey = ++pkNum;
                    }
                    if (!string.IsNullOrWhiteSpace(colAttr.DbType) && colAttr.DbType.IndexOf("Char(", StringComparison.OrdinalIgnoreCase)>= 0)
                    {
                        string len = System.Text.RegularExpressions.Regex.Match(colAttr.DbType, @"\(([^)]*)\)").Groups[1].Value;
                        int maxLength = -1;
                        if (int.TryParse(len, out maxLength))
                        {
                            fieldInfo.maxLength = (short)maxLength;
                        }
                    }
                    bool isArray = false;
                    fieldInfo.dataType = this.ServiceContainer.ValueConverter.DataTypeFromType(propInfo2.PropertyType, out isArray);
                    if (colAttr.DbType.IndexOf("NOT NULL", StringComparison.OrdinalIgnoreCase) > 0)
                        fieldInfo.isNullable = false;
                    fieldInfo.fieldType = colAttr.IsVersion?FieldType.RowTimeStamp: FieldType.None;
                    fieldInfo.isReadOnly = !propInfo2.CanWrite;
                    dbSetInfo.fieldInfos.Add(fieldInfo);
                });

                PropertyInfo[] navPropList = entityType.GetProperties().Where(p => p.IsDefined(typeof(System.Data.Linq.Mapping.AssociationAttribute), false)).ToArray();
                Array.ForEach(navPropList, (propInfo3) =>
                {
                    var attr = (System.Data.Linq.Mapping.AssociationAttribute)propInfo3.GetCustomAttributes(typeof(System.Data.Linq.Mapping.AssociationAttribute), false).First();

                    Association ass = metadata.Associations.Where(a => a.name == attr.Name).FirstOrDefault();
                    if (ass == null)
                    {
                        ass = new Association();
                        ass.name = attr.Name;
                        metadata.Associations.Add(ass);
                    }
                    FieldRel frel;
                    if (propInfo3.PropertyType.IsGenericType && propInfo3.PropertyType.GetGenericTypeDefinition() == typeof(System.Data.Linq.EntitySet<>))
                    {
                        frel = ass.fieldRels.Where(f => f.childField == attr.OtherKey && f.parentField == attr.ThisKey).FirstOrDefault();
                        if (frel == null)
                        {
                            frel = new FieldRel();
                            ass.fieldRels.Add(frel);
                        }
                        Type entityType3 = propInfo3.PropertyType.GetGenericArguments().First();
                        ass.childDbSetName =entityType3.Name;
                        ass.parentToChildrenName = propInfo3.Name;
                        frel.childField= attr.OtherKey;
                        frel.parentField = attr.ThisKey;
                    }
                    else
                    {
                        frel = ass.fieldRels.Where(f => f.childField == attr.ThisKey && f.parentField == attr.OtherKey).FirstOrDefault();
                        if (frel == null)
                        {
                            frel = new FieldRel();
                            ass.fieldRels.Add(frel);
                        }
                        ass.parentDbSetName = propInfo3.PropertyType.Name;
                        ass.childToParentName = propInfo3.Name;
                        frel.childField = attr.ThisKey;
                        frel.parentField = attr.OtherKey;
                    }
                });
            });

            return metadata;
        }

        protected override Task ExecuteChangeSet()
        {
            using (TransactionScope transScope = new TransactionScope(TransactionScopeOption.RequiresNew, 
                new TransactionOptions { IsolationLevel = IsolationLevel.ReadCommitted, Timeout = TimeSpan.FromMinutes(1.0) }))
            {
                this.DB.SubmitChanges();
                
                transScope.Complete();
            }
            return this.AfterExecuteChangeSet();
        }
        #endregion

        public TDB DB
        {
            get
            {
                if (this._db == null)
                {
                    this._db = this.CreateDataContext();
                    if (this._db != null)
                    {
                        this._ownsDb = true;
                    }
                }
                return this._db;
            }
        }

        protected override void Dispose(bool isDisposing)
        {
            if (this._db != null && this._ownsDb)
            {
                this._db.Dispose();
                this._db = null;
                this._ownsDb = false;
            }

            base.Dispose(isDisposing);
        }
    }
}
