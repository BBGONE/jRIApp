using RIAppDemo.BLL.DataServices;
using RIAppDemo.Models;
using System;
using System.IO;
using System.Threading.Tasks;
using System.Web.Mvc;
using System.Web.SessionState;

namespace RIAppDemo.Controllers
{
    [SessionState(SessionStateBehavior.Disabled)]
    public class UploadController : Controller
    {
        public ActionResult Index()
        {
            return new EmptyResult();
        }

        public async Task<ActionResult> ThumbnailUpload()
        {
            try
            {
                UploadedFile file;
                if (!this.GetFileFromRequest(out file))
                {
                    return new HttpStatusCodeResult(200);
                }

                if (file.FileName != null)
                {
                    var filename = Path.GetFileName(file.FileName);
                    if (filename != null)
                    {
                        var svc = ThumbnailServiceFactory.Create(User);
                        using (svc)
                        {
                            await svc.SaveThumbnail(file.DataID, file.FileName, file.Contents);
                        }
                    }
                }

                return new HttpStatusCodeResult(200);
            }
            catch (Exception)
            {
                return new HttpStatusCodeResult(400);
            }
        }
    }
}