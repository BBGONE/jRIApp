using System.Web.Mvc;

namespace RIAPP.DataService.Mvc.Utils
{
    public class NoCompressFileResult : FileContentResult, INoCompressResult
    {
        public NoCompressFileResult(byte[] fileContents, string contentType)
            : base(fileContents, contentType)
        {
        }
    }
}