using RIAppDemo.BLL.DataServices.DataManagers;
using RIAppDemo.BLL.Models;
using RIAppDemo.DAL.EF;
using RIAPP.DataService.DomainService.Interfaces;

namespace RIAppDemo.BLL.DataServices.Config
{
    public static class DataManagerConfig
    {
        public static void RegisterDataManagers(IDataManagerContainer dataManagers)
        {
            dataManagers.RegisterDataManager<RIAppDemoServiceEF, CustomerAddressDM, CustomerAddress>(
                dataService => { return new CustomerAddressDM(); });
            dataManagers.RegisterDataManager<RIAppDemoServiceEF, ProductDM, Product>(
                dataService => { return new ProductDM(); });
            dataManagers.RegisterDataManager<RIAppDemoServiceEF, LookUpProductDM, LookUpProduct>(
                dataService => { return new LookUpProductDM(); });
        }
    }
}