namespace RIAPP.DataService.DomainService.Security
{
    public interface IAuthorizeData
    {
        string[] Roles { get; }
        string RolesString { get; }
    }
}
