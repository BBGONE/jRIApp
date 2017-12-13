using System.IO;
using System.Net.Mime;
using System.Text;
using System.Web.Mvc;
using RIAPP.DataService.Utils.Interfaces;

namespace RIAPP.DataService.Mvc
{
    public class ChunkedResult<T> : ActionResult
        where T : class
    {
        private static readonly string ResultContentType = "application/json";
        private readonly ISerializer _serializer;

        public ChunkedResult(T res, ISerializer serializer)
        {
            Data = res;
            _serializer = serializer;
        }

        public T Data { get; set; }

        public override void ExecuteResult(ControllerContext context)
        {
            var response = context.HttpContext.Response;
            response.ContentType = ResultContentType;
            response.Buffer = false;
            var stream = context.HttpContext.Response.OutputStream;
            using (var writer = new StreamWriter(stream, Encoding.UTF8, 1024*32, true))
            {
                _serializer.Serialize(Data, writer);
            }
            response.End();
        }
    }
}