using System.Threading.Tasks;

namespace RIAPP.DataService.DomainService
{
    public interface IDataManager
    {
        Task AfterExecuteChangeSet();
    }

    public interface IDataManager<TModel> : IDataManager
    {
        void Insert(TModel model);
        void Update(TModel model);
        void Delete(TModel model);
    }
}