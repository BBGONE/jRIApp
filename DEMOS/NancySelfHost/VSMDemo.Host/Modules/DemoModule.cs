using Nancy;
using Nancy.Security;

namespace VSMDemo.Host.Modules
{
	public class DemoModule : NancyModule
	{
        public DemoModule()
            : base("/demo")
		{
            this.RequiresAuthentication();

            Get["/datagrid"] = x => {
                dynamic model = new DynamicDictionary();
                model.Title = "DataGrid Demo";
                model.siteBase = this.Context.Request.Url.SiteBase;
                return View["DataGridDemo.html", model]; 
            };
		}
	}
}
