using System.Web.Optimization;
using RIAppDemo.Filters;

namespace RIAppDemo
{
    public static class BundleConfig
    {
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new GZipScriptBundle("~/bundles/jriapp", new JsMinify()).Include("~/Scripts/jriapp/jriapp_shared.js", "~/Scripts/jriapp/jriapp.js", 
                "~/Scripts/jriapp/jriapp_db.js", "~/Scripts/jriapp/jriapp_ui.js", "~/Scripts/jriapp/jriapp_langs.js"));
            bundles.Add(new GZipScriptBundle("~/bundles/shared", new JsMinify()).Include("~/Scripts/demo/shared/shared.js"));
        }

    }
}