using System.Web.Mvc;

namespace RIAPP.DataService.Mvc.Utils
{
    public class NotModifiedResult : ActionResult
    {
        public override void ExecuteResult(ControllerContext context)
        {
            var response = context.HttpContext.Response;
            response.StatusCode = 304;
            response.StatusDescription = "Not Modified";
            response.SuppressContent = true;
        }
    }
}