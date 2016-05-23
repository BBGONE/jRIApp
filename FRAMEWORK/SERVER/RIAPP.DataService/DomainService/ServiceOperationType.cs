namespace RIAPP.DataService.DomainService
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