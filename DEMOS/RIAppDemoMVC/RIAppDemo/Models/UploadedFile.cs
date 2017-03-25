using RIAppDemo.BLL.Utils;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Mvc;

namespace RIAppDemo.Models
{
    class StreamDataContent : IDataContent
    {
        private Stream _stream;

        public StreamDataContent(Stream stream)
        {
            this._stream = stream;
        }

        public Task CopyToAsync(Stream stream, int bufferSize = 131072)
        {
            return this._stream.CopyToAsync(stream);
        }

        public void CleanUp()
        {
            //noop
        }
    }

    public static class UploadExtensions
    {
        public static UploadedFile RetrieveFileFromRequest(this Controller controller)
        {
            var Request = controller.Request;
            string filename = null;
            string fileType = null;
            int fileSize = 0;
            int id = -1;
            var files = Request.Files;

            if (files.Count > 0)
            {
                //uploading the old way using form post
                var file = files[0];
                fileSize = file.ContentLength;
                fileType = file.ContentType;
                filename = file.FileName;
                return new UploadedFile()
                {
                    FileName = filename,
                    ContentType = fileType,
                    FileSize = fileSize,
                    Content = file.InputStream,
                    DataID = id
                };
            }
            else if (Request.ContentLength > 0)
            {
                //uploading using ajax post
                fileSize = Request.ContentLength;
                filename = Request.Headers["X-File-Name"];
                fileType = Request.Headers["X-File-Type"];
                id = int.Parse(Request.Headers["X-Data-ID"]);
                return new UploadedFile()
                {
                    FileName = filename,
                    ContentType = fileType,
                    FileSize = fileSize,
                    Content = Request.InputStream,
                    DataID = id,
                    ChunkNum = Request.Headers.Keys.OfType<string>().Contains("X-Chunk-Num") ? int.Parse(Request.Headers["X-Chunk-Num"]) : (int?)null,
                    ChunkSize = Request.Headers.Keys.OfType<string>().Contains("X-Chunk-Size") ? int.Parse(Request.Headers["X-Chunk-Size"]) : (int?)null,
                    ChunkTotal = Request.Headers.Keys.OfType<string>().Contains("X-Chunk-Count") ? int.Parse(Request.Headers["X-Chunk-Count"]) : (int?)null
                };
            }
            else
            {
                throw new InvalidOperationException("No file stream");
            }
        }

        private static string LoadChunk(Controller controller, UploadedFile file)
        {
            string dir = controller.ControllerContext.HttpContext.Server.MapPath(@"~/App_Data");
            dir = Path.Combine(dir, "TEMP");
            string filepath = Path.Combine(dir, string.Format("{0}{1}.tmp", Path.GetFileNameWithoutExtension(file.FileName), file.DataID));
            if (!System.IO.Directory.Exists(dir))
            {
                System.IO.Directory.CreateDirectory(dir);
            }

            using (var fileStream = (file.ChunkNum == 1) ? System.IO.File.Create(filepath) : System.IO.File.Open(filepath, FileMode.Append))
            {
                file.Content.CopyTo(fileStream);
            }

            return filepath;
        }

        public static UploadedFile GetFileFromRequest(this Controller controller)
        {
            UploadedFile file = RetrieveFileFromRequest(controller);
            if (file.IsChunked)
            {
                string filepath = LoadChunk(controller, file);

                if (file.IsLastChunk)
                {
                    file.DataContent = new FileContent(filepath);
                }
            }
            else
            {
                file.DataContent = new StreamDataContent(file.Content);
            }

            return file;
        }
    }

    public class UploadedFile
    {
        public int DataID { get; set; }
        public int FileSize { get; set; }
        public string FileName { get; set; }
        public string ContentType { get; set; }
        public Stream Content { get; set; }
        public IDataContent DataContent { get; set; }

        public int? ChunkNum { get; set; }

        public int? ChunkSize { get; set; }

        public int? ChunkTotal { get; set; }

        public bool IsLastChunk { get { return ChunkTotal.HasValue && ChunkTotal.Value == ChunkNum.Value; } }

        public bool IsChunked { get { return ChunkTotal.HasValue; } }
    }
}