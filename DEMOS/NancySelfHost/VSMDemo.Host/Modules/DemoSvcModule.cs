using System;
using System.IO;
using System.Linq;
using Nancy;
using Nancy.Responses;
using Nancy.Security;
using RIAppDemo.BLL.DataServices;
using RIAPP.DataService.Nancy;

namespace VSMDemo.Host.Modules
{
    public class DemoSvcModule : RIAPPSvcModule<RIAppDemoService>
	{
        private IRootPathProvider _rootPathProvider;

        public DemoSvcModule(IRootPathProvider rootPathProvider)
            : base("/demosvc")
		{
            this._rootPathProvider = rootPathProvider;
            this.RequiresAuthentication();

            Get["/template/{name}"] = parameters =>
            {
                return this.DownloadTemplate(parameters.name??this.Request.Query.name);
            };

            Get["/thumbnail/{id}"] = parameters =>
            {
                return DownloadThumbnail(parameters.id ?? this.Request.Query.id);
            };

            Post["/thumbnail"] = parameters =>
            {
                return this.UploadThumbnail();
            };
		}

        protected string GetTemplatePath(string name)
        {
            string baseDir = this._rootPathProvider.GetRootPath();
            string path1 = Path.Combine(baseDir, "Views", "demo", "templates");
            string path2 = Path.GetFullPath(Path.Combine(path1, string.Format("{0}.html", name)));
            if (!path2.StartsWith(path1) || !File.Exists(path2))
                throw new Exception("Invalid path");
            return path2;
        }

        protected Response DownloadTemplate(string name)
        {
            string templatePath = this.GetTemplatePath(name);
            Response response = new Response();
            //response.Headers.Add("Content-Disposition", "attachment; filename=test.txt");
            response.ContentType = System.Net.Mime.MediaTypeNames.Text.Plain;
            response.StatusCode = HttpStatusCode.OK;
            response.Contents = stream =>
            {
                using (var fileStream = File.OpenRead(templatePath))
                {
                    fileStream.CopyTo(stream);
                }
            };

            return response;
        }

        protected Response DownloadThumbnail(string id)
        {
            var svc = this.GetDomainService();
            MemoryStream stream = new MemoryStream();
            string fileName = svc.GetThumbnail(int.Parse(id), stream);
            if (string.IsNullOrEmpty(fileName))
                return (Response)HttpStatusCode.NotFound;
            stream.Position = 0;
            Response response = new StreamResponse(() => stream, System.Net.Mime.MediaTypeNames.Image.Jpeg);
            response.Headers.Add("Content-Disposition", string.Format("attachment; filename=\"{0}\"", fileName));
            return response;
        }

        protected Response UploadThumbnail()
        {
            try
            {
                var file = RetrieveFileFromRequest(this.Request);

                if (file.FileName != null)
                {
                    string filename = Path.GetFileName(file.FileName);
                    if (filename != null)
                    {
                        var svc = this.GetDomainService();
                        svc.SaveThumbnail(file.DataID, file.FileName, file.Contents);
                    }
                }

                return HttpStatusCode.OK;
            }
            catch (Exception)
            {
                return HttpStatusCode.BadRequest;
            }
        }

        private static VSMDemo.Host.ViewModels.UploadedFile RetrieveFileFromRequest(Request request)
        {
            string filename = null;
            string fileType = null;
            int fileSize = 0;
            int id = -1;
            Stream fileContents = null;

            //int size = (int)this.Context.Request.Body.Length;
            if (request.Headers.ContentLength > 0)
            {
                fileSize = (int)request.Headers.ContentLength;
                fileContents = request.Body;
                filename = request.Headers["X-File-Name"].FirstOrDefault();
                fileType = request.Headers["X-File-Type"].FirstOrDefault();
                id = int.Parse(request.Headers["X-Data-ID"].FirstOrDefault());
            }

            return new VSMDemo.Host.ViewModels.UploadedFile()
            {
                FileName = filename,
                ContentType = fileType,
                FileSize = fileSize,
                Contents = fileContents,
                DataID = id
            };
        }
	}
}
