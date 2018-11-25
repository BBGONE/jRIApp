using System;
using System.Collections.Generic;
using System.Linq;
using RIAPP.DataService.DomainService.Exceptions;
using RIAPP.DataService.DomainService.Types;
using RIAPP.DataService.Resources;
using RIAPP.DataService.Utils;

namespace RIAPP.DataService.DomainService
{
    public class ParentChildNode
    {
        public ParentChildNode(RowInfo childRow)
        {
            ChildRow = childRow;
        }

        public RowInfo ChildRow { get; set; }

        public RowInfo ParentRow { get; set; }

        public Association association { get; set; }
    }

    internal class ChangeSetGraph
    {
        private readonly LinkedList<RowInfo> _allList = new LinkedList<RowInfo>();
        private readonly LinkedList<RowInfo> _deleteList = new LinkedList<RowInfo>();
        private readonly LinkedList<RowInfo> _insertList = new LinkedList<RowInfo>();
        private readonly CachedMetadata _metadata;
        private readonly LinkedList<RowInfo> _updateList = new LinkedList<RowInfo>();
        private DbSet[] sortedDbSets;
        private readonly LinkedList<ParentChildNode> updateNodes = new LinkedList<ParentChildNode>();


        public ChangeSetGraph(ChangeSet changeSet, CachedMetadata metadata)
        {
            this.changeSet = changeSet;
            _metadata = metadata;
        }

        public ChangeSet changeSet { get; }

        public IEnumerable<RowInfo> insertList
        {
            get { return _insertList; }
        }

        public IEnumerable<RowInfo> updateList
        {
            get { return _updateList; }
        }

        public IEnumerable<RowInfo> deleteList
        {
            get { return _deleteList; }
        }

        public IEnumerable<RowInfo> allList
        {
            get { return _allList; }
        }

        private void getAllParentDbSets(HashSet<String> list, string dbSetName)
        {
            var parentDbNames = _metadata.Associations.Values.Where(a => a.childDbSetName == dbSetName)
                    .Select(x => x.parentDbSetName)
                    .ToArray();

            foreach (var name in parentDbNames)
            {
                if (!list.Contains(name))
                {
                    list.Add(name);
                    getAllParentDbSets(list, name);
                }
            }
        }

        private int DbSetComparison(DbSet dbSet1, DbSet dbSet2)
        {
            var parentDbNames = new HashSet<String>();
            getAllParentDbSets(parentDbNames, dbSet1.dbSetName);
            if (parentDbNames.Contains(dbSet2.dbSetName))
            {
                return 1;
            }

            parentDbNames.Clear();
            getAllParentDbSets(parentDbNames, dbSet2.dbSetName);
            if (parentDbNames.Contains(dbSet1.dbSetName))
            {
                return -1;
            }

            return string.Compare(dbSet1.dbSetName, dbSet2.dbSetName);
        }

        private static string GetKey(RowInfo rowInfo)
        {
            return string.Format("{0}:{1}", rowInfo.dbSetInfo.dbSetName, rowInfo.clientKey);
        }

        private Dictionary<string, RowInfo> GetRowsMap()
        {
            var result = new Dictionary<string, RowInfo>();
            foreach (var dbSet in changeSet.dbSets)
            {
                var dbSetInfo = _metadata.DbSets[dbSet.dbSetName];
                if (dbSetInfo.EntityType == null)
                    throw new DomainServiceException(string.Format(ErrorStrings.ERR_DB_ENTITYTYPE_INVALID,
                        dbSetInfo.dbSetName));

                foreach (var rowInfo in dbSet.rows)
                {
                    rowInfo.dbSetInfo = dbSetInfo;
                    result.Add(GetKey(rowInfo), rowInfo);
                }
            }
            return result;
        }

        public void Prepare()
        {
            var rowsMap = GetRowsMap();

            foreach (var trackAssoc in changeSet.trackAssocs)
            {
                var assoc = _metadata.Associations[trackAssoc.assocName];
                var pkey = string.Format("{0}:{1}", assoc.parentDbSetName, trackAssoc.parentKey);
                var ckey = string.Format("{0}:{1}", assoc.childDbSetName, trackAssoc.childKey);
                var parent = rowsMap[pkey];
                var child = rowsMap[ckey];
                var childNode = new ParentChildNode(child);
                childNode.association = assoc;
                childNode.ParentRow = parent;
                updateNodes.AddLast(childNode);
            }


            foreach (var dbSet in GetSortedDbSets())
            {
                foreach (var rowInfo in dbSet.rows)
                {
                    var dbSetInfo = rowInfo.dbSetInfo;
                    _allList.AddLast(rowInfo);
                    switch (rowInfo.changeType)
                    {
                        case ChangeType.Added:
                            _insertList.AddLast(rowInfo);
                            break;
                        case ChangeType.Updated:
                            _updateList.AddLast(rowInfo);
                            break;
                        case ChangeType.Deleted:
                            _deleteList.AddFirst(rowInfo);
                            break;
                        default:
                            throw new DomainServiceException(string.Format(ErrorStrings.ERR_REC_CHANGETYPE_INVALID,
                                dbSetInfo.EntityType.Name, rowInfo.changeType));
                    }
                }
            }
        }

        public DbSet[] GetSortedDbSets()
        {
            if (sortedDbSets == null)
            {
                var array = changeSet.dbSets.ToArray();
                Array.Sort(array, DbSetComparison);
                sortedDbSets = array;
            }
            return sortedDbSets;
        }

        public ParentChildNode[] GetChildren(RowInfo parent)
        {
            return updateNodes.Where(u => u.ParentRow == parent).ToArray();
        }

        public ParentChildNode[] GetParents(RowInfo child)
        {
            return updateNodes.Where(u => u.ChildRow == child).ToArray();
        }
    }
}