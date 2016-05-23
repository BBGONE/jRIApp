using System;

namespace RIAPP.DataService.DomainService.Interfaces
{
    public class RegisteredDMEventArgs : EventArgs
    {
        public RegisteredDMEventArgs(Type dataManagerType, Type modeltype)
        {
            DataManagerType = dataManagerType;
            ModelType = modeltype;
        }

        public Type DataManagerType { get; private set; }
        public Type ModelType { get; private set; }
    }

    public interface IDataManagerContainer
    {
        bool isDataManagerRegistered(Type modelType);
        object GetDataManager(BaseDomainService dataService, Type modelType);

        IDataManager<TModel> GetDataManager<TModel>(BaseDomainService dataService)
            where TModel : class;

        void RegisterDataManager<TDataService, TDataManager, TModel>(
            Func<TDataService, IDataManager<TModel>> dataManagerFactory)
            where TModel : class
            where TDataManager : IDataManager<TModel>
            where TDataService : BaseDomainService;

        event EventHandler<RegisteredDMEventArgs> RegisteredDM;
    }
}