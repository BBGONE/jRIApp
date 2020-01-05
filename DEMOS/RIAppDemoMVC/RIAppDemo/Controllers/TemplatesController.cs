using RIAppDemo.Models;
using System.Web.Mvc;
using System.Web.SessionState;

namespace RIAppDemo.Controllers
{
    [SessionState(SessionStateBehavior.Disabled)]
    public class TemplatesController : Controller
    {
        public ActionResult Download(string name)
        {
            return View(name);
        }

        public ActionResult SPADemoTemplate1()
        {
            return View(new SPATemplate());
        }

        public ActionResult SPADemoTemplate2()
        {
            return View(new SPATemplate());
        }

        public ActionResult SPADemoTemplate3()
        {
            return View(new SPATemplate());
        }
    }
}