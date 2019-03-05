namespace RIAPP.DataService.Core.Security
{
    public interface IAuthorizeData
    {
        string[] Roles { get; }
        string RolesString { get; }
    }
}
