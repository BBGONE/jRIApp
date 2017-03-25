using RIAppDemo.BLL.DataServices;
using RIAppDemo.Models;
using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Mime;
using System.Threading.Tasks;
using System.Web.Http;

namespace RIAppDemo.Controllers
{
    public class FileController : ApiController
    {
        #region Public API

        [HttpPost]
        public async Task<HttpResponseMessage> UploadThumbnail(HttpRequestMessage request)
        {
            try
            {
                var file = await this.GetFileFromRequest(request);
                
                if (file.DataContent != null)
                {
                    try
                    {
                        var filename = Path.GetFileName(file.FileName);
                        if (filename != null)
                        {
                            using (var svc = ThumbnailServiceFactory.Create(User))
                            {
                                await svc.SaveThumbnail2(file.DataID, file.FileName, file.DataContent);
                            }
                        }
                    }
                    finally
                    {
                        file.DataContent.CleanUp();
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
        public async Task<HttpResponseMessage> DownloadThumbnail(HttpRequestMessage request, string id)
        {
            try
            {
                using (var svc = ThumbnailServiceFactory.Create(User))
                {
                    var stream = new MemoryStream();
                    var fileName = await svc.GetThumbnail(int.Parse(id), stream);
                    if (string.IsNullOrEmpty(fileName))
                        return Request.CreateResponse(HttpStatusCode.NotFound);
                    stream.Position = 0;
                    var result = new HttpResponseMessage(HttpStatusCode.OK);
                    result.Content = new StreamContent(stream);
                    result.Content.Headers.ContentType = new MediaTypeHeaderValue(MediaTypeNames.Image.Jpeg);
                    result.Content.Headers.Add("Content-Disposition", new[] { string.Format("attachment; filename=\"{0}\"", fileName) });
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