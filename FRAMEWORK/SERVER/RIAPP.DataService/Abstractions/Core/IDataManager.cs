using RIAPP.DataService.Core.Types;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RIAPP.DataService.Core
{
    public interface IDataManager
    {
        IEnumerable<DbSetInfo> DbSetInfo
        {
            get;
        }
        Task AfterExecuteChangeSet(ChangeSetRequest changeSet);
        Task AddRefreshedRows(ChangeSetRequest changeSet, SubResultList refreshResults);
    }

    public interface IDataManager<TModel> : IDataManager
    {
        void Insert(TModel model);
        void Update(TModel model);
        void Delete(TModel model);
    }
}