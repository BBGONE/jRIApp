namespace RIAPP.DataService.Core
{
    public enum ServiceOperationType
    {
        None,
        Query,
        SaveChanges,
        RowRefresh,
        InvokeMethod
    }
}