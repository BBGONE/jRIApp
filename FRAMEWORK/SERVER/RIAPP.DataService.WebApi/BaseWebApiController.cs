using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Net.Mime;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http;
using RIAPP.DataService.DomainService;
using RIAPP.DataService.DomainService.Interfaces;
using RIAPP.DataService.DomainService.Types;
using RIAPP.DataService.Utils.Interfaces;

namespace RIAPP.DataService.WebApi
{
    public abstract class BaseWebApiController<T> : ApiController
        where T : BaseDomainService
    {
        private Lazy<T> _dataService;
        private ISerializer _serializer;

        public BaseWebApiController()
        {
            _serializer = new Serializer();
            MediaFormatter = new JsonMediaTypeFormatter();
            _dataService = new Lazy<T>(() => { return CreateDomainService(); }, true);
        }

        protected MediaTypeFormatter MediaFormatter { get; }

        protected T DataService
        {
            get { return _dataService.Value; }
        }

        protected virtual T CreateDomainService()
        {
            var args = new ServiceArgs(_serializer, User);
            var service = (IDomainService) Activator.CreateInstance(typeof(T), args);
            return (T) service;
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing && _dataService.IsValueCreated)
            {
                ((IDisposable) _dataService.Value).Dispose();
            }
            _dataService = null;
            _serializer = null;
            base.Dispose(disposing);
        }

        public class PlainTextActionResult : IHttpActionResult
        {
            public PlainTextActionResult(HttpRequestMessage request, string message)
            {
                Request = request;
                Message = message;
            }

            public string Message { get; }
            public HttpRequestMessage Request { get; }

            public Task<HttpResponseMessage> ExecuteAsync(CancellationToken cancellationToken)
            {
                return Task.FromResult(ExecuteResult());
            }

            public HttpResponseMessage ExecuteResult()
            {
                var response = new HttpResponseMessage(HttpStatusCode.OK);

                response.Content = new StringContent(Message);

                response.RequestMessage = Request;
                return response;
            }
        }

        public class ChunkedActionResult<TRes> : IHttpActionResult
            where TRes : class
        {
            private static readonly string ResultContentType = MediaTypeNames.Text.Plain;
            private readonly ISerializer _serializer;

            public ChunkedActionResult(HttpRequestMessage request, TRes res, ISerializer serializer)
            {
                Request = request;
                Data = res;
                _serializer = serializer;
            }

            public TRes Data { get; }
            public HttpRequestMessage Request { get; }

            public Task<HttpResponseMessage> ExecuteAsync(CancellationToken cancellationToken)
            {
                return Task.FromResult(ExecuteResult());
            }

            public HttpResponseMessage ExecuteResult()
            {
                var response = new HttpResponseMessage(HttpStatusCode.OK);

                response.Content = new PushStreamContent((stream, httpContent, context) =>
                {
                    using (var writer = new StreamWriter(stream, Encoding.UTF8, 1024*32))
                    {
                        _serializer.Serialize(Data, writer);
                    }
                }, ResultContentType);

                response.RequestMessage = Request;
                return response;
            }
        }

        #region Public API

        [ActionName("xaml")]
        [HttpGet]
        public virtual IHttpActionResult GetXAML(HttpRequestMessage request, bool isDraft = true)
        {
            var info = DataService.ServiceCodeGen(new CodeGenArgs("xaml") { isDraft = isDraft });
            return new PlainTextActionResult(request, info);
        }

        [ActionName("csharp")]
        [HttpGet]
        public virtual IHttpActionResult GetCSHARP(HttpRequestMessage request)
        {
            var info = DataService.ServiceCodeGen(new CodeGenArgs("csharp"));
            return new PlainTextActionResult(request, info);
        }

        [ActionName("typescript")]
        [HttpGet]
        public virtual IHttpActionResult GetTypeScript(HttpRequestMessage request)
        {
            var comment =
                string.Format(
                    "\tGenerated from: {0} on {1:yyyy-MM-dd} at {1:HH:mm}\r\n\tDon't make manual changes here, because they will be lost when this db interface will be regenerated!",
                    request.RequestUri, DateTime.Now);
            var info = DataService.ServiceCodeGen(new CodeGenArgs("ts") { comment = comment });
            return new PlainTextActionResult(request, info);
        }

        /*
        [ActionName("permissions")]
        [HttpGet]
        public virtual HttpResponseMessage Permissions()
        {
            var res = this.DataService.ServiceGetPermissions();
            return Request.CreateResponse<Permissions>(HttpStatusCode.OK, res, this.MediaFormatter);
        }
        */

        [ActionName("permissions")]
        [HttpGet]
        public virtual IHttpActionResult Permissions(HttpRequestMessage request)
        {
            var res = DataService.ServiceGetPermissions();
            return new ChunkedActionResult<Permissions>(request, res, _serializer);
        }

        [ActionName("query")]
        [HttpPost]
        public virtual async Task<IHttpActionResult> Query(HttpRequestMessage request, QueryRequest query)
        {
            var svc = DataService;
            if (svc == null)
            {
                var response = Request.CreateResponse(HttpStatusCode.NotFound, "Service not found");
                throw new HttpResponseException(response);
            }
            var res = await svc.ServiceGetData(query).ConfigureAwait(false);
            return new ChunkedActionResult<QueryResponse>(request, res, _serializer);
        }

        [ActionName("refresh")]
        [HttpPost]
        public virtual async Task<IHttpActionResult> Refresh(HttpRequestMessage request, RefreshInfo refreshInfo)
        {
            var svc = DataService;
            if (svc == null)
            {
                var response = Request.CreateResponse(HttpStatusCode.NotFound, "Service not found");
                throw new HttpResponseException(response);
            }
            var res = await svc.ServiceRefreshRow(refreshInfo).ConfigureAwait(false);
            return new ChunkedActionResult<RefreshInfo>(request, res, _serializer);
        }

        /*
        [ActionName("invoke")]
        [HttpPost]
        public virtual async Task<HttpResponseMessage> Invoke(InvokeRequest invokeInfo)
        {
            var svc = this.DataService;
            if (svc == null)
            {
                var response = Request.CreateResponse(HttpStatusCode.NotFound, "Service not found");
                throw new HttpResponseException(response);
            }
            var svcData = await svc.ServiceInvokeMethod(invokeInfo).ConfigureAwait(false);
            return Request.CreateResponse<InvokeResponse>(HttpStatusCode.OK, svcData, this.MediaFormatter);
        }
        */

        [ActionName("invoke")]
        [HttpPost]
        public virtual async Task<IHttpActionResult> Invoke(HttpRequestMessage request, InvokeRequest invokeInfo)
        {
            var svc = DataService;
            if (svc == null)
            {
                var response = Request.CreateResponse(HttpStatusCode.NotFound, "Service not found");
                throw new HttpResponseException(response);
            }
            var res = await svc.ServiceInvokeMethod(invokeInfo).ConfigureAwait(false);
            return new ChunkedActionResult<InvokeResponse>(request, res, _serializer);
        }

        [ActionName("save")]
        [HttpPost]
        public virtual async Task<IHttpActionResult> Save(HttpRequestMessage request, ChangeSet changeSet)
        {
            var res = await DataService.ServiceApplyChangeSet(changeSet).ConfigureAwait(false);
            return new ChunkedActionResult<ChangeSet>(request, res, _serializer);
        }

        #endregion
    }
}