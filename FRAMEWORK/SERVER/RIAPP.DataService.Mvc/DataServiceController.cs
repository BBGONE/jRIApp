using RIAPP.DataService.DomainService;
using RIAPP.DataService.DomainService.CodeGen;
using RIAPP.DataService.DomainService.Types;
using RIAPP.DataService.Mvc.Utils;
using RIAPP.DataService.Utils;
using System;
using System.Net.Mime;
using System.Text;
using System.Threading.Tasks;
using System.Web.Mvc;
using System.Web.SessionState;

namespace RIAPP.DataService.Mvc
{
    [NoCache]
    [SessionState(SessionStateBehavior.Disabled)]
    public abstract class DataServiceController<TService> : Controller
        where TService : BaseDomainService
    {
        private TService _DomainService;

        public DataServiceController(TService domainService)
        {
            _DomainService = domainService;
        }

        protected IDomainService DomainService
        {
            get { return _DomainService; }
        }

        public ISerializer Serializer
        {
            get
            {
                return _DomainService.Serializer;
            }
        }

        [ActionName("typescript")]
        [HttpGet]
        public ActionResult GetTypeScript()
        {
            string url = ControllerContext.HttpContext.Request.RawUrl;
            DateTime now = DateTime.Now;
            var comment = $"\tGenerated from: {url} on {now:yyyy-MM-dd} at {now:HH:mm}\r\n\tDon't make manual changes here, they will be lost when this interface will be regenerated!";
            var content = DomainService.ServiceCodeGen(new CodeGenArgs("ts") { comment = comment });
            var res = new ContentResult();
            res.ContentType = MediaTypeNames.Text.Plain;
            res.Content = content;
            return res;
        }

        [ActionName("xaml")]
        [HttpGet]
        public ActionResult GetXAML(bool isDraft = true)
        {
            var content = DomainService.ServiceCodeGen(new CodeGenArgs("xaml") { isDraft = isDraft });
            var res = new ContentResult();
            res.ContentEncoding = Encoding.UTF8;
            res.ContentType = MediaTypeNames.Text.Plain;
            res.Content = content;
            return res;
        }

        [ActionName("csharp")]
        [HttpGet]
        public ActionResult GetCSharp()
        {
            var content = DomainService.ServiceCodeGen(new CodeGenArgs("csharp"));
            var res = new ContentResult();
            res.ContentEncoding = Encoding.UTF8;
            res.ContentType = MediaTypeNames.Text.Plain;
            res.Content = content;
            return res;
        }

        [ChildActionOnly]
        public string PermissionsInfo()
        {
            var info = DomainService.ServiceGetPermissions().Result;
            return Serializer.Serialize(info);
        }

        [ActionName("code")]
        [HttpGet]
        public ActionResult GetCode(string lang)
        {
            if (lang != null)
            {
                switch (lang.ToLowerInvariant())
                {
                    case "ts":
                    case "typescript":
                        return GetTypeScript();
                    case "xaml":
                        return GetXAML();
                    case "csharp":
                        return GetCSharp();
                    default:
                        throw new Exception(string.Format("Unknown lang argument: {0}", lang));
                }
            }
            return GetTypeScript();
        }

        [ActionName("permissions")]
        [HttpGet]
        public async Task<ActionResult> GetPermissions()
        {
            var res = await DomainService.ServiceGetPermissions();
            return new ChunkedResult<Permissions>(res, Serializer);
        }

        [ActionName("query")]
        [HttpPost]
        public async Task<ActionResult> PerformQuery([SericeParamsBinder] QueryRequest request)
        {
            var res = await DomainService.ServiceGetData(request).ConfigureAwait(false);
            return new ChunkedResult<QueryResponse>(res, Serializer);
        }

        [ActionName("save")]
        [HttpPost]
        public async Task<ActionResult> Save([SericeParamsBinder] ChangeSet changeSet)
        {
            var res = await DomainService.ServiceApplyChangeSet(changeSet).ConfigureAwait(false);
            return new ChunkedResult<ChangeSet>(res, Serializer);
        }

        [ActionName("refresh")]
        [HttpPost]
        public async Task<ActionResult> Refresh([SericeParamsBinder] RefreshInfo refreshInfo)
        {
            var res = await DomainService.ServiceRefreshRow(refreshInfo).ConfigureAwait(false);
            return new ChunkedResult<RefreshInfo>(res, Serializer);
        }

        [ActionName("invoke")]
        [HttpPost]
        public async Task<ActionResult> Invoke([SericeParamsBinder] InvokeRequest invokeInfo)
        {
            var res = await DomainService.ServiceInvokeMethod(invokeInfo).ConfigureAwait(false);
            return new ChunkedResult<InvokeResponse>(res, Serializer);
        }

        protected TService GetDomainService()
        {
            return _DomainService;
        }

    }
}