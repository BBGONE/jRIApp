using Nancy;
using System;
using System.IO;
using RIAPPInterface = RIAPP.DataService.Utils.Interfaces;

namespace RIAPP.DataService.Nancy
{

    public class ChunkedResult<T> : Response
        where T: class
    {
        private static string ResultContentType = "application/json";
        private RIAPPInterface.ISerializer _serializer;

        public ChunkedResult(T res, RIAPPInterface.ISerializer serializer)
        {
            this.Data = res;
            this._serializer = serializer;
            this.ContentType = ResultContentType;
            this.StatusCode = HttpStatusCode.OK;
            this.Contents = this.ExecuteResult();
        }

        public T Data { get; set; }

        public Action<Stream> ExecuteResult()
        {
            return stream =>
            {
                using (var writer = new StreamWriter(stream, System.Text.Encoding.UTF8, 1024 * 32))
                {
                    this._serializer.Serialize(this.Data, writer);
                }
            };
        }
    }
}
