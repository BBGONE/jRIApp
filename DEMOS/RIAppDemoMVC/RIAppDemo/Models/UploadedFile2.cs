using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;

namespace RIAppDemo.Models
{
    public static class UploadExtensions2
    {
        public static UploadedFile2 RetrieveFileFromRequest(HttpRequestMessage request)
        {
            string filename = null;
            string fileType = null;
            var fileSize = 0;
            var id = -1;
            int? ChunkNum = null, ChunkSize= null, ChunkCount = null;
            IEnumerable<string> values;

            if (request.Headers.TryGetValues("X-File-Name", out values))
                filename = values.First();
            if (request.Headers.TryGetValues("X-File-Type", out values))
                fileType = values.First();
            if (request.Headers.TryGetValues("X-Data-ID", out values))
                id = int.Parse(values.First());
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

        private static async Task<string> LoadChunk(ApiController controller, UploadedFile2 file)
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
                string filepath = await LoadChunk(controller, file);

                if (file.IsLastChunk)
                {
                    using (var fileStream = System.IO.File.Open(filepath, FileMode.Open, FileAccess.Read))
                    {
                        file.FileStream = new MemoryStream();
                        fileStream.CopyTo(file.FileStream);
                        file.FileStream.Position = 0;
                    }
                    System.IO.File.Delete(filepath);
                }
            }
            else
            {
                file.FileStream = new MemoryStream();
                await file.Content.CopyToAsync(file.FileStream);
                file.FileStream.Position = 0;
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
        public Stream FileStream { get; set; }

        public int? ChunkNum { get; set; }

        public int? ChunkSize { get; set; }

        public int? ChunkTotal { get; set; }

        public bool IsLastChunk { get { return ChunkTotal.HasValue && ChunkTotal.Value == ChunkNum.Value; } }

        public bool IsChunked { get { return ChunkTotal.HasValue; } }
    }
}