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
            dataManagers.RegisterDataManager<CustomerAddress, CustomerAddressDM>();
            dataManagers.RegisterDataManager<Product, ProductDM>();
            dataManagers.RegisterDataManager<LookUpProduct, LookUpProductDM>();
        }
    }
}