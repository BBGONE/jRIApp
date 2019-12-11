namespace RIAPP.DataService.Core
{
    public interface IDataServiceComponent
    {
        IServiceContainer ServiceContainer { get; }

        BaseDomainService DataService { get; }
    }
}