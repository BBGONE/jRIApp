using RIAPP.DataService.Core.Types;
using System.Threading.Tasks;

namespace RIAPP.DataService.Core
{
    public interface IDataManager
    {
        Task AfterExecuteChangeSet(ChangeSetRequest changeSet);
        Task AfterChangeSetCommited(ChangeSetRequest changeSet, SubResultList refreshResult);
    }

    public interface IDataManager<TModel> : IDataManager
    {
    }
}