using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;

namespace RIAppDemo
{
    public class MvcApplication : HttpApplication
    {
        private static IServiceProvider _serviceProvider;
        private static readonly AppEvents _appEvents = new AppEvents();

        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();

            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);

            BundleConfig.RegisterBundles(BundleTable.Bundles);
            BundleTable.EnableOptimizations = true;

            this.Configuration(new ServiceCollection());
        }

        protected void Application_AuthenticateRequest(object sender, EventArgs e)
        {
            var isNoRoles = true;

            var basicPrincipal = new ClaimsPrincipal(
             new ClaimsIdentity(
                 new Claim[] {
                        new Claim("Permission", "CanUpdate"),
                        isNoRoles? new Claim(ClaimTypes.Role, "Admins"): null,
                        isNoRoles? new Claim(ClaimTypes.Role,  "Users"): null,
                        new Claim(ClaimTypes.Name, "DUMMY_USER"),
                        new Claim(ClaimTypes.NameIdentifier, "DUMMY_USER Basic")
               }.Where(c => c != null),
                     "Basic"));


            HttpContext.Current.User = Thread.CurrentPrincipal = basicPrincipal;
        }

        protected void Application_End(object sender, EventArgs e)
        {
            if (_serviceProvider != null)
            {
                (_serviceProvider as IDisposable).Dispose();
            }
        }

        protected void Application_BeginRequest(Object sender, EventArgs e)
        {
            _appEvents.RaiseBegin(this);
        }

        protected void Application_EndRequest(Object sender, EventArgs e)
        {
            _appEvents.RaiseEnd(this);
        }

        #region Dependency injection related

        public void Configuration(IServiceCollection services)
        {
            Startup.ConfigureServices(services);

            _serviceProvider = services.BuildServiceProvider(true);

            var resolver = new DefaultDependencyResolver(_serviceProvider, _appEvents);

            DependencyResolver.SetResolver(resolver);
        }

        internal class AppEvents
        {
            public void RaiseBegin(HttpApplication app)
            {
                this.OnBeginRequest?.Invoke(app, EventArgs.Empty);
            }

            public void RaiseEnd(HttpApplication app)
            {
                this.OnEndRequest?.Invoke(app, EventArgs.Empty);
            }

            public event EventHandler OnBeginRequest;
            public event EventHandler OnEndRequest;
        }

        internal class DefaultDependencyResolver : IDependencyResolver
        {
            private const string PROVIDER_KEY = "SVC_PROVIDER_KEY";
            private const string PROVIDER_SCOPE_KEY = "SVC_PROVIDER_SCOPE_KEY";
            private readonly IServiceProvider _rootProvider;
            private readonly AppEvents _appEvents;

            public DefaultDependencyResolver(IServiceProvider serviceProvider, AppEvents appEvents)
            {
                this._rootProvider = serviceProvider;
                this._appEvents = appEvents;
                this._appEvents.OnBeginRequest += _appEvents_OnBeginRequest;
                this._appEvents.OnEndRequest += _appEvents_OnEndRequest;
            }

            private void _appEvents_OnBeginRequest(object sender, EventArgs e)
            {
                HttpContext ctx = HttpContext.Current;
                IServiceScopeFactory scopeFactory = _rootProvider.GetRequiredService<IServiceScopeFactory>();
                IServiceScope scope = scopeFactory.CreateScope();
                var scopeProvider = scope.ServiceProvider;
                ctx.Items.Add(PROVIDER_KEY, scopeProvider);
                ctx.Items.Add(PROVIDER_SCOPE_KEY, scope);
            }

            private void _appEvents_OnEndRequest(object sender, EventArgs e)
            {
                try
                {
                    HttpContext ctx = HttpContext.Current;
                    var scope = (IServiceScope)ctx.Items[PROVIDER_SCOPE_KEY];
                    scope.Dispose();
                }
                catch
                {
                    // TO DO: Log any Error
                }
            }


            public object GetService(Type serviceType)
            {
                var ctx = HttpContext.Current;
                if (ctx == null)
                {
                    return this._rootProvider.GetService(serviceType);
                }
                else
                {
                    var provider = (IServiceProvider)ctx.Items[PROVIDER_KEY];
                    return provider.GetService(serviceType);
                }
            }

            public IEnumerable<object> GetServices(Type serviceType)
            {
                var ctx = HttpContext.Current;
                if (ctx == null)
                {
                    return this._rootProvider.GetServices(serviceType);
                }
                else
                {
                    var provider = (IServiceProvider)ctx.Items[PROVIDER_KEY];
                    return provider.GetServices(serviceType);
                }

            }
        }

        #endregion
    }
}