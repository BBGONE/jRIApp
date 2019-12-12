namespace RIAPP.DataService.Core.Types
{
    public enum FieldType
    {
        None = 0,
        ClientOnly = 1,
        Calculated = 2,
        Navigation = 3,
        RowTimeStamp = 4,
        Object = 5,
        ServerCalculated = 6
    }

    public enum ChangeType
    {
        None = 0,
        Added = 1,
        Updated = 2,
        Deleted = 3
    }

    public enum DataType
    {
        None = 0,
        String = 1,
        Bool = 2,
        Integer = 3,
        Decimal = 4,
        Float = 5,
        DateTime = 6,
        Date = 7,
        Time = 8,
        Guid = 9,
        Binary = 10
    }

    public enum DateConversion
    {
        None = 0,
        ServerLocalToClientLocal = 1,
        UtcToClientLocal = 2
    }


    public enum SortOrder
    {
        ASC = 0,
        DESC = 1
    }


    public enum FilterType
    {
        Equals = 0,
        Between = 1,
        StartsWith = 2,
        EndsWith = 3,
        Contains = 4,
        Gt = 5,
        Lt = 6,
        GtEq = 7,
        LtEq = 8,
        NotEq = 9
    }

    public enum ValueFlags
    {
        None = 0,
        Changed = 1,
        Setted = 2,
        Refreshed = 4
    }

    public enum DeleteAction
    {
        NoAction = 0,
        Cascade = 1,
        SetNulls = 2
    }

    public enum MethodType
    {
        None = 0,
        Query = 1,
        Invoke = 2,
        Insert = 3,
        Update = 4,
        Delete = 5,
        Validate = 6,
        Refresh = 7
    }
}