using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using RIAppDemo.BLL.Utils;
using System;

namespace RIAppDemo.Models
{
    class HttpDataContent : IDataContent
    {
        private HttpContent _content;

        public HttpDataContent(HttpContent content)
        {
            this._content = content;
        }

        public Task CopyToAsync(Stream stream, int bufferSize = 131072)
        {
            return this._content.CopyToAsync(stream);
        }

        public void CleanUp()
        {
           //noop
        }
    }

    public static class UploadExtensions2
    {
        private static UploadedFile2 RetrieveFileFromRequest(HttpRequestMessage request)
        {
            string filename = null;
            string fileType = null;
            int fileSize = 0;
            int id = -1;
            int? ChunkNum = null, ChunkSize= null, ChunkCount = null;

            IEnumerable<string> values;
            if (request.Headers.TryGetValues("X-File-Size", out values))
                fileSize = int.Parse(values.First());
            else
                throw new InvalidOperationException("Invalid File-Size header");

            if (request.Headers.TryGetValues("X-File-Name", out values))
            {
                filename = values.First();
                filename = Uri.UnescapeDataString(filename);
            }
            else
                throw new InvalidOperationException("Invalid File-Name header");

            if (request.Headers.TryGetValues("X-File-Type", out values))
                fileType = values.First();
            if (request.Headers.TryGetValues("X-Data-ID", out values))
                id = int.Parse(values.First());
            else
                throw new InvalidOperationException("Invalid Data-ID header");

            if (request.Headers.TryGetValues("X-Chunk-Num", out values))
                ChunkNum = int.Parse(values.First());
            if (request.Headers.TryGetValues("X-Chunk-Size", out values))
                ChunkSize = int.Parse(values.First());
            if (request.Headers.TryGetValues("X-Chunk-Count", out values))
                ChunkCount = int.Parse(values.First());

            return new UploadedFile2()
            {
                FileName = filename,
                ContentType = fileType,
                FileSize = fileSize,
                Content = request.Content,
                DataID = id,
                ChunkNum =ChunkNum,
                ChunkSize = ChunkSize,
                ChunkTotal = ChunkCount
            };
        }

        private static async Task<string> SaveChunk(ApiController controller, UploadedFile2 file)
        {
            string dir = System.Web.Hosting.HostingEnvironment.MapPath(@"~/App_Data");
            dir = Path.Combine(dir, "TEMP");
            string filepath = Path.Combine(dir, string.Format("{0}{1}.tmp", Path.GetFileNameWithoutExtension(file.FileName), file.DataID));
            if (!System.IO.Directory.Exists(dir))
            {
                System.IO.Directory.CreateDirectory(dir);
            }

            using (var fileStream = (file.ChunkNum == 1) ? System.IO.File.Create(filepath) : System.IO.File.Open(filepath, FileMode.Append))
            {
                await file.Content.CopyToAsync(fileStream);
            }

            return filepath;
        }

        public static async Task<UploadedFile2> GetFileFromRequest(this ApiController controller, HttpRequestMessage request)
        {
            UploadedFile2 file = RetrieveFileFromRequest(request);
            if (file.IsChunked)
            {
                string filepath = await SaveChunk(controller, file);

                if (file.IsLastChunk)
                {
                    file.DataContent = new FileContent(filepath);
                }
            }
            else
            {
                file.DataContent = new HttpDataContent(file.Content);
            }

            return file;
        }
    }

    public class UploadedFile2
    {
        public int DataID { get; set; }
        public int FileSize { get; set; }
        public string FileName { get; set; }
        public string ContentType { get; set; }
        public HttpContent Content { get; set; }
        public IDataContent DataContent { get; set; }

        public int? ChunkNum { get; set; }

        public int? ChunkSize { get; set; }

        public int? ChunkTotal { get; set; }

        public bool IsLastChunk { get { return ChunkTotal.HasValue && ChunkTotal.Value == ChunkNum.Value; } }

        public bool IsChunked { get { return ChunkTotal.HasValue; } }
    }
}