using System.Configuration;
using System.IO;
using System.Web;
using System.Web.Mvc;

namespace RIAPP.DataService.Mvc.Utils
{
    public static class UrlHelperEx
    {
        public static string Content(this UrlHelper Url, string Path, bool addTimeStamp)
        {
            if (!addTimeStamp)
            {
                return Url.Content(Path);
            }

            var serverPath = HttpContext.Current.Server.MapPath(Path);
            var lastWrite = File.GetLastWriteTimeUtc(serverPath);
            var result = lastWrite.Ticks.ToString();
            return Url.Content(Path) + "?t=" + result;
        }

        public static string Asset(this UrlHelper Url, string path, bool minify)
        {
            var bust = Bust(Url);
            var min = minify ? "1" : "0";

            return Url.RouteUrl("Assets", new { bust, min, path });
        }

        public static string Bust(this UrlHelper Url)
        {
            return ConfigurationManager.AppSettings["browserCacheBust"];
        }
    }
}