using RIAPP.DataService.Core.Config;
using RIAppDemo.BLL.DataServices.DataManagers;
using RIAppDemo.BLL.Models;
using RIAppDemo.DAL.EF;

namespace RIAppDemo.BLL.DataServices.Config
{
    public static class DataManagerConfig
    {

        public static void RegisterDataManagers(IDataManagerRegister dataManagers)
        {
            dataManagers.RegisterDataManager<CustomerAddress, CustomerAddressDM>();
            dataManagers.RegisterDataManager<LookUpProduct, LookUpProductDM>();

            //dataManagers.RegisterDataManager<Product, ProductDM>();
            // just for for testing  - using raw types
            dataManagers.RegisterDataManager(typeof(Product), typeof(ProductDM));
        }
    }
}