using System.Collections;
using System.Collections.Generic;
using System.Linq;
using RIAPP.DataService.DomainService.Exceptions;
using RIAPP.DataService.DomainService.Types;
using RIAPP.DataService.Resources;
using RIAPP.DataService.Utils;
using RIAPP.DataService.Utils.Extensions;
using RIAPP.DataService.Utils.Interfaces;

namespace RIAPP.DataService.DomainService
{
    internal class SubsetsGenerator
    {
        private readonly IDataHelper _dataHelper;
        private readonly BaseDomainService _domainService;

        public SubsetsGenerator(BaseDomainService domainService)
        {
            _domainService = domainService;
            _dataHelper = _domainService.ServiceContainer.DataHelper;
        }

        public IEnumerable<Subset> CreateSubsets(DbSetInfo dbSetInfo, IEnumerable<object> entities,
            string[] includePaths)
        {
            if (includePaths.Length == 0)
                return Enumerable.Empty<Subset>();
            var visited = new Dictionary<string, Subset>();
            var metadata = MetadataHelper.EnsureMetadataInitialized(_domainService);
            foreach (var includePath in includePaths)
            {
                var pathParts = includePath.Split('.');
                var nextParts = pathParts.Skip(1).ToArray();
                CreateSubset(dbSetInfo, entities, pathParts[0], nextParts, visited);
            }
            return visited.Values;
        }

        public SubsetList CreateSubsets(IEnumerable<SubResult> subResults)
        {
            var result = new SubsetList();
            if (subResults == null)
                return result;
            var metadata = MetadataHelper.EnsureMetadataInitialized(_domainService);
            var rowCount = 0;
            foreach (var subResult in subResults)
            {
                var dbSetInfo = metadata.dbSets[subResult.dbSetName];
                if (result.Any(r => r.dbSetName == subResult.dbSetName))
                    throw new DomainServiceException(string.Format("The included results already have {0} entities",
                        dbSetInfo.dbSetName));
                var entityList = new LinkedList<object>();
                foreach (var entity in subResult.Result)
                {
                    entityList.AddLast(entity);
                    ++rowCount;
                }
                var rowGenerator = new RowGenerator(dbSetInfo, entityList, _dataHelper);
                var current = new Subset
                {
                    dbSetName = dbSetInfo.dbSetName,
                    rows = rowGenerator.CreateDistinctRows(ref rowCount),
                    names = dbSetInfo.GetNames()
                };
                result.Add(current);
            }
            return result;
        }

        private void CreateSubset(DbSetInfo dbSetInfo, IEnumerable<object> inputEntities, string propertyName,
            string[] nextParts, Dictionary<string, Subset> visited)
        {
            var metadata = MetadataHelper.EnsureMetadataInitialized(_domainService);
            var isChildProperty = false;
            DbSetInfo nextDbSetInfo = null;
            var assoc =
                metadata.associations.Values.Where(
                    a => a.parentDbSetName == dbSetInfo.dbSetName && a.parentToChildrenName == propertyName)
                    .FirstOrDefault();
            if (assoc != null)
            {
                isChildProperty = true;
                nextDbSetInfo = metadata.dbSets[assoc.childDbSetName];
            }
            else
            {
                assoc =
                    metadata.associations.Values.Where(
                        a => a.childDbSetName == dbSetInfo.dbSetName && a.childToParentName == propertyName)
                        .FirstOrDefault();
                if (assoc == null)
                {
                    throw new DomainServiceException(string.Format(ErrorStrings.ERR_INCL_NAVIG_INVALID,
                        propertyName + (nextParts.Length > 0 ? "." + string.Join(".", nextParts) : "")));
                }

                nextDbSetInfo = metadata.dbSets[assoc.parentDbSetName];
            }
            if (visited.ContainsKey(nextDbSetInfo.dbSetName + "." + propertyName))
                return;

            var rowCount = 0;
            object propValue;
            var resultEntities = new LinkedList<object>();
            foreach (var entity in inputEntities)
            {
                propValue = _dataHelper.GetValue(entity, propertyName, true);
                if (isChildProperty && propValue is IEnumerable)
                {
                    foreach (var childEntity in (IEnumerable) propValue)
                    {
                        resultEntities.AddLast(childEntity);
                        ++rowCount;
                    }
                }
                else if (!isChildProperty && propValue != null)
                {
                    resultEntities.AddLast(propValue);
                    ++rowCount;
                }
            }

            //create temporary result without rows
            //fills rows at the end of the method
            var current = new Subset
            {
                dbSetName = nextDbSetInfo.dbSetName,
                rows = new Row[0],
                names = nextDbSetInfo.GetNames()
            };
            visited.Add(nextDbSetInfo.dbSetName + "." + propertyName, current);
            if (nextParts.Length > 0)
                CreateSubset(nextDbSetInfo, resultEntities, nextParts[0], nextParts.Skip(1).ToArray(), visited);
            var rowGenerator = new RowGenerator(nextDbSetInfo, resultEntities, _dataHelper);
            current.rows = rowGenerator.CreateDistinctRows(ref rowCount);
        }
    }
}