using System;
using System.Linq;
using System.Security.Principal;
using Nancy;
using Nancy.Responses;
using Nancy.ModelBinding;
using RIAPPInterface = RIAPP.DataService.Utils.Interfaces;
using System.Threading.Tasks;
using RIAPP.DataService.DomainService;
using RIAPP.DataService.DomainService.Interfaces;
using RIAPP.DataService.DomainService.Types;


namespace RIAPP.DataService.Nancy
{
    public abstract class RIAPPSvcModule<T> : NancyModule, IDisposable
        where T : BaseDomainService
    {
        private RIAPPInterface.ISerializer _serializer;
        private Lazy<IDomainService> _DomainService;
        private static BindingConfig bconfig = new BindingConfig() { BodyOnly = true, IgnoreErrors = false, Overwrite = true };
        private IPrincipal _user;
        private object _sync_user = new object();

        public RIAPPSvcModule()
            : this("/")
        {

        }

        public RIAPPSvcModule(string modulePath)
            : base(modulePath)
        {
            this._serializer = new Serializer();
            this._DomainService = new Lazy<IDomainService>(() => this.CreateDomainService(), true);

            Get["/code"] = x =>
            {
                return new TextResponse(this.GetCode(this.Context.Request.Query.lang));
            };

            Get["/permissions"] = x =>
            {
                return this.GetPermissionsInfo();
            };

            Post["/query", runAsync: true] = async (parameters, ct) =>
            {
                var request = this.DeSerialize<QueryRequest>(this.Context.Request.Body);
                return await this.PerformQuery(request);
            };

            Post["/save", runAsync: true] = async (parameters, ct) =>
            {
                var request = this.DeSerialize<ChangeSet>(this.Context.Request.Body);
                return await this.Save(request);
            };

            Post["/refresh", runAsync: true] = async (parameters, ct) =>
            {
                var request = this.DeSerialize<RefreshInfo>(this.Context.Request.Body);
                return await this.Refresh(request);
            };

            Post["/invoke", runAsync: true] = async (parameters, ct) =>
            {
                var request = this.DeSerialize<InvokeRequest>(this.Context.Request.Body); ;
                return await this.Invoke(request);
            };
        }

        #region PRIVATE METHODS
        private string _GetTypeScript()
        {
            string comment = string.Format("\tGenerated from: {0} on {1:yyyy-MM-dd HH:mm} at {1:HH:mm}\r\n\tDon't make manual changes here, because they will be lost when this db interface will be regenerated!", this.Context.Request.Url.ToString(), DateTime.Now);
            var info = DomainService.ServiceCodeGen(new CodeGenArgs("ts") { comment = comment });
            return info;
        }

        private string _GetXAML()
        {
            var info = DomainService.ServiceCodeGen(new CodeGenArgs("xaml") { isDraft = true });
            return info;
        }

        private string _GetCSharp()
        {
            var info = DomainService.ServiceCodeGen(new CodeGenArgs("csharp"));
            return info;
        }
        #endregion

        private TClass DeSerialize<TClass>(System.IO.Stream stream)
        {
            int len = (int)this.Context.Request.Body.Length;
            if (len > 1024 * 32)
                throw new Exception("BODY length exceeds 32KB!");
            byte[] buffer = new byte[len];
            this.Context.Request.Body.Read(buffer, 0, len);
            string input = System.Text.Encoding.UTF8.GetString(buffer);
            return (TClass)this._serializer.DeSerialize(input, typeof(TClass));
        }

        public virtual IPrincipal User
        {
            get
            {
                lock (this._sync_user)
                {
                    if (this._user != null)
                        return this._user;
                    var ident = this.Context.CurrentUser;
                    if (ident != null)
                    {
                        IIdentity identity = new GenericIdentity(ident.UserName, "form");
                        this._user = new GenericPrincipal(identity, ident.Claims.ToArray());
                    }
                    else
                    {
                        this._user = new GenericPrincipal(new GenericIdentity(""), new string[0]);
                    }
                    return this._user;
                }
            }
        }

        protected virtual IDomainService CreateDomainService()
        {
            ServiceArgs args = new ServiceArgs(this._serializer, this.User);
            var service = (IDomainService)Activator.CreateInstance(typeof(T), args);
            return service;
        }

        public Response GetPermissionsInfo()
        {
            var res = this.DomainService.ServiceGetPermissions();
            return new ChunkedResult<Permissions>(res, this.Serializer);
            //return Response.AsJson(res);
        }

        protected string GetCode(string lang)
        {
            if (lang != null)
            {
                switch (lang.ToLowerInvariant())
                {
                    case "ts":
                    case "typescript":
                        return this._GetTypeScript();
                    case "xaml":
                        return this._GetXAML();
                    case "c#":
                    case "csharp":
                        return this._GetCSharp();
                    default:
                        throw new Exception(string.Format("Unknown type argument: {0}", lang));
                }
            }
            else
                return this._GetTypeScript();
        }

        protected async Task<Response> PerformQuery(QueryRequest request)
        {
            var res = await this.DomainService.ServiceGetData(request);
            return new ChunkedResult<QueryResponse>(res, this.Serializer);
        }

        protected async Task<Response> Save(ChangeSet changeSet)
        {
            var res = await this.DomainService.ServiceApplyChangeSet(changeSet);
            return new ChunkedResult<ChangeSet>(res, this.Serializer);
            //return Response.AsJson(res);
        }

        protected async Task<Response> Refresh(RefreshInfo refreshInfo)
        {
            var res = await this.DomainService.ServiceRefreshRow(refreshInfo);
            return new ChunkedResult<RefreshInfo>(res, this.Serializer);
            //return Response.AsJson(res);
        }

        protected async Task<Response> Invoke(InvokeRequest invokeInfo)
        {
            var res = await this.DomainService.ServiceInvokeMethod(invokeInfo);
            return new ChunkedResult<InvokeResponse>(res, this.Serializer);
            //return Response.AsJson(res);
        }

        protected IDomainService DomainService
        {
            get
            {
                return this._DomainService.Value;
            }
        }

        protected T GetDomainService()
        {
            return (T)this.DomainService;
        }

        public RIAPPInterface.ISerializer Serializer
        {
            get { return this._serializer; }
        }

        protected virtual void Dispose(bool disposing)
        {
            if (disposing && this._DomainService.IsValueCreated)
            {
                this._DomainService.Value.Dispose();
            }
            this._DomainService = null;
            this._serializer = null;
        }

        void IDisposable.Dispose()
        {
            this.Dispose(true);
        }
    }
}
