using System.Web.Mvc;
using System.Web.SessionState;
using RIAppDemo.BLL.DataServices;
using RIAPP.DataService.Mvc;

namespace RIAppDemo.Controllers
{
    [SessionState(SessionStateBehavior.Disabled)]
    public class RIAppDemoServiceEFController : DataServiceController<RIAppDemoServiceEF>
    {
        [ChildActionOnly]
        public string ProductModelData()
        {
            var info = GetDomainService().GetQueryData("ProductModel", "ReadProductModel");
            return Serializer.Serialize(info);
        }

        [ChildActionOnly]
        public string ProductCategoryData()
        {
            var info = GetDomainService().GetQueryData("ProductCategory", "ReadProductCategory");
            return Serializer.Serialize(info);
        }
    }
}