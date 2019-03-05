using RIAPP.DataService.Core.Metadata;
using System.Collections.Generic;

namespace RIAPP.DataService.Core.Types
{
    public class DBSetList : List<DbSetInfo>
    {
    }

    public class AssocList : List<Association>
    {
    }

    public class FieldRelList : List<FieldRel>
    {
    }

    public class FieldsList : List<Field>
    {
    }

    public class MethodsList : List<MethodDescription>
    {
        public MethodsList()
        {
        }

        public MethodsList(IEnumerable<MethodDescription> items) :
            base(items)
        {
        }
    }

    public class PermissionList : List<DbSetPermit>
    {
    }

    public class RowsList : List<RowInfo>
    {
    }

    public class DbSetList : List<DbSet>
    {
    }

    public class TrackAssocList : List<TrackAssoc>
    {
    }

    public class ValuesList : List<ValueChange>
    {
    }

    public class SubResultList : List<SubResult>
    {
    }

    public class SubsetList : List<Subset>
    {
    }

    public class AssociationsDictionary : Dictionary<string, Association>
    {
    }

    public class DbSetsDictionary : Dictionary<string, DbSetInfo>
    {
    }
}