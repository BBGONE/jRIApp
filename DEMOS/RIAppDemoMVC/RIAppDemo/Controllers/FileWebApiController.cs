using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Mime;
using System.Web.Http;
using RIAppDemo.BLL.DataServices;

namespace RIAppDemo.Controllers
{
    public class FileController : ApiController
    {
        private UploadedFile RetrieveFileFromRequest(HttpRequestMessage request)
        {
            string filename = null;
            string fileType = null;
            var fileSize = 0;
            var id = -1;
            IEnumerable<string> values;

            if (request.Headers.TryGetValues("X-File-Name", out values))
                filename = values.First();
            if (request.Headers.TryGetValues("X-File-Type", out values))
                fileType = values.First();
            if (request.Headers.TryGetValues("X-Data-ID", out values))
                id = int.Parse(values.First());

            return new UploadedFile
            {
                FileName = filename,
                ContentType = fileType,
                FileSize = fileSize,
                Content = request.Content,
                DataID = id
            };
        }

        public class UploadedFile
        {
            public int DataID { get; set; }
            public int FileSize { get; set; }
            public string FileName { get; set; }
            public string ContentType { get; set; }
            public HttpContent Content { get; set; }
        }

        #region Public API

        [HttpPost]
        public HttpResponseMessage UploadThumbnail(HttpRequestMessage request)
        {
            try
            {
                var file = RetrieveFileFromRequest(request);

                if (file.FileName != null)
                {
                    var filename = Path.GetFileName(file.FileName);
                    if (filename != null)
                    {
                        var svc = ThumbnailServiceFactory.Create(User);
                        using (svc)
                        {
                            svc.SaveThumbnail2(file.DataID, file.FileName, file.Content.CopyToAsync);
                        }
                    }
                }

                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                var response = Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
                throw new HttpResponseException(response);
            }
        }

        [HttpGet]
        public HttpResponseMessage DownloadThumbnail(HttpRequestMessage request, string id)
        {
            try
            {
                var svc = ThumbnailServiceFactory.Create(User);
                using (svc)
                {
                    var stream = new MemoryStream();
                    var fileName = svc.GetThumbnail(int.Parse(id), stream);
                    if (string.IsNullOrEmpty(fileName))
                        return Request.CreateResponse(HttpStatusCode.NotFound);
                    stream.Position = 0;
                    var result = new HttpResponseMessage(HttpStatusCode.OK);
                    result.Content = new StreamContent(stream);
                    result.Content.Headers.ContentType = new MediaTypeHeaderValue(MediaTypeNames.Image.Jpeg);
                    result.Content.Headers.Add("Content-Disposition",
                        new[] {string.Format("attachment; filename=\"{0}\"", fileName)});
                    return result;
                }
            }
            catch (Exception ex)
            {
                var response = Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
                throw new HttpResponseException(response);
            }
        }

        [HttpGet]
        public HttpResponseMessage DownloadTemplate(HttpRequestMessage request, string name)
        {
            try
            {
                var baseDir = AppDomain.CurrentDomain.BaseDirectory;
                var path1 = Path.Combine(baseDir, "Templates");
                var path2 = Path.GetFullPath(Path.Combine(path1, string.Format("{0}.html", name)));
                if (!path2.StartsWith(path1))
                    return Request.CreateResponse(HttpStatusCode.NotFound);
                var result = new HttpResponseMessage(HttpStatusCode.OK);
                var stream = File.OpenRead(path2);
                result.Content = new StreamContent(stream);
                result.Content.Headers.ContentType = new MediaTypeHeaderValue(MediaTypeNames.Text.Plain);
                return result;
            }
            catch (Exception ex)
            {
                var response = Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
                throw new HttpResponseException(response);
            }
        }

        #endregion
    }
}