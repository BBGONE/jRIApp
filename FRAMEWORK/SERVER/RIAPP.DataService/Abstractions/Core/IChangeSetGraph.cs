using RIAPP.DataService.Core.Types;
using System.Collections.Generic;

namespace RIAPP.DataService.Core
{
    public interface IChangeSetGraph
    {
        IEnumerable<RowInfo> AllList { get; }
        ChangeSetRequest ChangeSet { get; }
        IEnumerable<RowInfo> DeleteList { get; }
        IEnumerable<RowInfo> InsertList { get; }
        IEnumerable<RowInfo> UpdateList { get; }

        ParentChildNode[] GetChildren(RowInfo parent);
        ParentChildNode[] GetParents(RowInfo child);
        DbSet[] GetSortedDbSets();
    }
}