using System;
using System.IO;
using System.Web.Mvc;
using System.Web.SessionState;
using RIAppDemo.BLL.DataServices;
using RIAppDemo.Models;

namespace RIAppDemo.Controllers
{
    [SessionState(SessionStateBehavior.Disabled)]
    public class UploadController : Controller
    {
        /// <summary>
        ///     Used in FileApi action
        /// </summary>
        /// <returns></returns>
        private UploadedFile RetrieveFileFromRequest()
        {
            string filename = null;
            string fileType = null;
            var fileSize = 0;
            var id = -1;
            Stream fileContents = null;

            if (Request.Files.Count > 0)
            {
                //they're uploading the old way
                var file = Request.Files[0];
                fileSize = file.ContentLength;
                fileContents = file.InputStream;
                fileType = file.ContentType;
                filename = file.FileName;
            }
            else if (Request.ContentLength > 0)
            {
                fileSize = Request.ContentLength;
                fileContents = Request.InputStream;
                filename = Request.Headers["X-File-Name"];
                fileType = Request.Headers["X-File-Type"];
                id = int.Parse(Request.Headers["X-Data-ID"]);
            }

            return new UploadedFile
            {
                FileName = filename,
                ContentType = fileType,
                FileSize = fileSize,
                Contents = fileContents,
                DataID = id
            };
        }

        public ActionResult Index()
        {
            return new EmptyResult();
        }

        public ActionResult ThumbnailUpload()
        {
            try
            {
                var file = RetrieveFileFromRequest();

                if (file.FileName != null)
                {
                    var filename = Path.GetFileName(file.FileName);
                    if (filename != null)
                    {
                        var svc = ThumbnailServiceFactory.Create(User);
                        using (svc)
                        {
                            svc.SaveThumbnail(file.DataID, file.FileName, file.Contents);
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