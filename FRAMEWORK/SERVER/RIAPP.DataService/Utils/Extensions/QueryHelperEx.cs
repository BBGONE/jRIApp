using System.Collections.Generic;
using System.Linq;
using System.Text;
using RIAPP.DataService.DomainService;
using RIAPP.DataService.DomainService.Exceptions;
using RIAPP.DataService.DomainService.Interfaces;
using RIAPP.DataService.DomainService.Types;
using RIAPP.DataService.Resources;

namespace RIAPP.DataService.Utils.Extensions
{
    public static class QueryHelperEx
    {
        public static T GetOriginal<T>(this IServicesProviderTmp dataService)
            where T : class
        {
            return RequestContext.Current.GetOriginal<T>();
        }

        public static T GetParent<T>(this IServicesProviderTmp dataService)
            where T : class
        {
            return RequestContext.Current.GetParent<T>();
        }

        public static QueryRequest GetCurrentQueryInfo(this IServicesProviderTmp dataService)
        {
            return RequestContext.Current.CurrentQueryInfo;
        }

        public static IQueryable<T> PerformSort<T>(this IServicesProviderTmp dataService, IQueryable<T> entities,
            SortInfo sort)
            where T : class
        {
            var result = entities;
            if (sort == null || sort.sortItems == null || sort.sortItems.Count == 0)
                return result;

            if (sort == null || sort.sortItems == null || sort.sortItems.Count == 0)
                return result;
            var first = true;
            var sb = new StringBuilder();
            foreach (var si in sort.sortItems)
            {
                var fldName = si.fieldName;
                if (!first)
                    sb.Append(",");
                sb.Append(fldName);
                if (si.sortOrder == SortOrder.DESC)
                {
                    sb.Append(" DESC");
                }
                first = false;
            }

            result = result.OrderBy(sb.ToString());
            return result;
        }

        public static IQueryable<T> PerformFilter<T>(this IServicesProviderTmp dataService, IQueryable<T> entities,
            FilterInfo filter, DbSetInfo dbInfo)
            where T : class
        {
            var dataHelper = dataService.ServiceContainer.DataHelper;
            var result = entities;
            if (filter == null || filter.filterItems == null || filter.filterItems.Count == 0)
                return result;
            var cnt = 0;
            var sb = new StringBuilder();
            var filterParams = new LinkedList<object>();
            foreach (var filterItem in filter.filterItems)
            {
                var field = dbInfo.fieldInfos.Where(finf => finf.fieldName == filterItem.fieldName).FirstOrDefault();
                if (field == null)
                    throw new DomainServiceException(string.Format(ErrorStrings.ERR_REC_FIELDNAME_INVALID,
                        dbInfo.dbSetName, filterItem.fieldName));
                if (cnt > 0)
                    sb.Append(" and ");
                switch (filterItem.kind)
                {
                    case FilterType.Equals:
                        if (filterItem.values.Count == 1)
                        {
                            var val = filterItem.values.FirstOrDefault();
                            if (val == null)
                            {
                                sb.AppendFormat("{0}==NULL", filterItem.fieldName);
                            }
                            else
                            {
                                sb.AppendFormat("{0}==@{1}", filterItem.fieldName, cnt);
                                filterParams.AddLast(dataHelper.DeserializeField(typeof(T), field, val));
                            }
                        }
                        else
                        {
                            var vals = new List<object>();
                            foreach (var v in filterItem.values)
                                vals.Add(dataHelper.DeserializeField(typeof(T), field, v));

                            sb.AppendFormat("@{0}.Contains(outerIt.{1})", cnt, filterItem.fieldName);
                            filterParams.AddLast(vals);
                        }
                        break;
                    case FilterType.StartsWith:
                        sb.AppendFormat("{0}.StartsWith(@{1})", filterItem.fieldName, cnt);
                        filterParams.AddLast(dataHelper.DeserializeField(typeof(T), field,
                            filterItem.values.FirstOrDefault()));
                        break;
                    case FilterType.EndsWith:
                        sb.AppendFormat("{0}.EndsWith(@{1})", filterItem.fieldName, cnt);
                        filterParams.AddLast(dataHelper.DeserializeField(typeof(T), field,
                            filterItem.values.FirstOrDefault()));
                        break;
                    case FilterType.Contains:
                        sb.AppendFormat("{0}.Contains(@{1})", filterItem.fieldName, cnt);
                        filterParams.AddLast(dataHelper.DeserializeField(typeof(T), field,
                            filterItem.values.FirstOrDefault()));
                        break;
                    case FilterType.Gt:
                        sb.AppendFormat("{0}>@{1}", filterItem.fieldName, cnt);
                        filterParams.AddLast(dataHelper.DeserializeField(typeof(T), field,
                            filterItem.values.FirstOrDefault()));
                        break;
                    case FilterType.Lt:
                        sb.AppendFormat("{0}<@{1}", filterItem.fieldName, cnt);
                        filterParams.AddLast(dataHelper.DeserializeField(typeof(T), field,
                            filterItem.values.FirstOrDefault()));
                        break;
                    case FilterType.GtEq:
                        sb.AppendFormat("{0}>=@{1}", filterItem.fieldName, cnt);
                        filterParams.AddLast(dataHelper.DeserializeField(typeof(T), field,
                            filterItem.values.FirstOrDefault()));
                        break;
                    case FilterType.LtEq:
                        sb.AppendFormat("{0}<=@{1}", filterItem.fieldName, cnt);
                        filterParams.AddLast(dataHelper.DeserializeField(typeof(T), field,
                            filterItem.values.FirstOrDefault()));
                        break;
                    case FilterType.NotEq:
                    {
                        var val = filterItem.values.FirstOrDefault();
                        if (val == null)
                        {
                            sb.AppendFormat("{0}!=NULL", filterItem.fieldName);
                        }
                        else
                        {
                            sb.AppendFormat("{0}!=@{1}", filterItem.fieldName, cnt);
                            filterParams.AddLast(dataHelper.DeserializeField(typeof(T), field, val));
                        }
                    }
                        break;
                    case FilterType.Between:
                        sb.AppendFormat("{0}>=@{1} and {0}<=@{2}", filterItem.fieldName, cnt, ++cnt);
                        filterParams.AddLast(dataHelper.DeserializeField(typeof(T), field,
                            filterItem.values.FirstOrDefault()));
                        filterParams.AddLast(dataHelper.DeserializeField(typeof(T), field,
                            filterItem.values.LastOrDefault()));
                        break;
                }

                ++cnt;
            }
            result = entities.Where(sb.ToString(), filterParams.ToArray());
            return result;
        }

        public static IQueryable<T> GetPage<T>(this IServicesProviderTmp dataService, IQueryable<T> entities, int pageIndex,
            int pageSize, int pageCount, DbSetInfo dbInfo)
            where T : class
        {
            var result = entities;
            if (!dbInfo.enablePaging || pageIndex < 0)
                return result;
            if (pageSize < 0)
                pageSize = 0;
            var skipRows = pageIndex*pageSize;
            result = Queryable.Take(Queryable.Skip(entities, skipRows), pageSize*pageCount);
            return result;
        }

        public static IQueryable<T> PerformQuery<T>(this IServicesProviderTmp dataService, IQueryable<T> entities,
            ref int? totalCount)
            where T : class
        {
            var reqCtxt = RequestContext.Current;
            var queryInfo = reqCtxt.CurrentQueryInfo;
            if (queryInfo.isIncludeTotalCount && !totalCount.HasValue)
            {
                totalCount = GetTotalCount(dataService, entities, queryInfo.filterInfo, queryInfo.dbSetInfo);
            }
            entities = PerformFilter(dataService, entities, queryInfo.filterInfo, queryInfo.dbSetInfo);
            entities = PerformSort(dataService, entities, queryInfo.sortInfo);
            entities = GetPage(dataService, entities, queryInfo.pageIndex, queryInfo.pageSize, queryInfo.pageCount,
                queryInfo.dbSetInfo);
            return entities;
        }

        public static T GetRefreshedEntity<T>(this IServicesProviderTmp dataService, IQueryable<T> entities,
            RefreshInfo info)
            where T : class
        {
            var keyValue = info.rowInfo.GetPKValues(dataService.ServiceContainer.DataHelper);
            var dbEntity = FindEntity(entities, info.rowInfo, keyValue);
            return (T) dbEntity;
        }

        public static int? GetTotalCount<T>(this IServicesProviderTmp dataService, IQueryable<T> entities,
            FilterInfo filter, DbSetInfo dbSetInfo)
            where T : class
        {
            IQueryable filtered_entities = PerformFilter(dataService, entities, filter, dbSetInfo);
            return filtered_entities.Count();
        }

        public static object FindEntity(IQueryable entities, RowInfo rowInfo, object[] pkValues)
        {
            var predicate = rowInfo.GetWherePKPredicate();

            if (pkValues == null || pkValues.Length < 1 || pkValues.Any(kv => kv == null))
            {
                throw new DomainServiceException(string.Format(ErrorStrings.ERR_ROWINFO_PKVAL_INVALID,
                    rowInfo.dbSetInfo.EntityType.Name, string.Join(";", pkValues)));
            }

            var query = entities.Where(predicate, pkValues);
            object dbEntity = null;
            var cnt = 0;
            foreach (var entity in query)
            {
                dbEntity = entity;
                ++cnt;
                if (cnt > 1)
                    throw new DomainServiceException(string.Format(ErrorStrings.ERR_ROWINFO_PKVAL_INVALID,
                        rowInfo.dbSetInfo.EntityType.Name, string.Join(";", pkValues)));
            }

            return dbEntity;
        }
    }
}