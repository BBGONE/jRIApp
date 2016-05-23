using System;
using System.IO;
using System.Reflection;
using Nancy;
using Nancy.Bootstrapper;
using Nancy.Conventions;
using Nancy.Cryptography;
using Nancy.Responses;
using Nancy.Session;
using Nancy.TinyIoc;
using VSMDemo.Host.Modules;

namespace VSMDemo.Host
{
    /// <summary>
    /// Custom path provider to change the app root two levels up from the exe file
    /// </summary>
    public class PathProvider : IRootPathProvider
    {
        public string GetRootPath()
        {
            var currentDirectory  = AppDomain.CurrentDomain.BaseDirectory;
            var result = Path.GetFullPath(Path.Combine(currentDirectory, @"..\..\"));
            return result;
        }
    }

	public class CustomBootstrapper : DefaultNancyBootstrapper
	{
        private CryptographyConfiguration _cryptographyConfiguration;

        protected override IRootPathProvider RootPathProvider
        {
            get
            {
                return new PathProvider();
            }
        }

		protected override void ConfigureApplicationContainer(TinyIoCContainer container)
		{
			base.ConfigureApplicationContainer(container);
		}

        protected override void ConfigureRequestContainer(TinyIoCContainer container, NancyContext context)
        {
            base.ConfigureRequestContainer(container, context);
            // Here we register our user mapper as a per-request singleton.
            // As this is now per-request we could inject a request scoped
            // database "context" or other request scoped services.
            container.Register<Nancy.Authentication.Forms.IUserMapper, VSMDemo.Host.Authentication.UserDatabase>();
        }

		protected override void ApplicationStartup(TinyIoCContainer container, IPipelines pipelines)
		{
			base.ApplicationStartup(container, pipelines);
            //need to replace default CryptographyConfiguration for the form authentication
            //because defaut KeyGenerator generate on each app startup new keys and cookies invalidate after that
            this._cryptographyConfiguration = new CryptographyConfiguration(
                new RijndaelEncryptionProvider(new PassphraseKeyGenerator("SuperSecretPass", new byte[] { 1, 2, 3, 4, 5, 6, 7, 8 })),
                new DefaultHmacProvider(new PassphraseKeyGenerator("UberSuperSecure1", new byte[] { 1, 2, 3, 4, 5, 6, 7, 8 })));

			CookieBasedSessions.Enable(pipelines);
		}

        protected override void ConfigureConventions(NancyConventions nancyConventions)
		{
            nancyConventions.StaticContentsConventions.Clear();
            nancyConventions.StaticContentsConventions.Add(AddStaticResourcePath("/resource", Assembly.GetAssembly(typeof(MainModule)), "VSMDemo.Host.Content.resource"));

            // static content
            nancyConventions.StaticContentsConventions.Add(Nancy.Conventions.StaticContentConventionBuilder.AddDirectory("scripts","Content/scripts"));
            nancyConventions.StaticContentsConventions.Add(Nancy.Conventions.StaticContentConventionBuilder.AddDirectory("content","Content"));

            // view location
            nancyConventions.ViewLocationConventions.Clear();
            nancyConventions.ViewLocationConventions.Add((viewName, model, context) =>
            {
                string module= context.ModulePath;
                if (string.IsNullOrEmpty(module))
                    module = context.ModuleName;
                if (string.IsNullOrEmpty(module))
                    return null;
                string result = Path.Combine("Views", module.Trim('/', '\\'), viewName);
                if (!string.IsNullOrEmpty(result))
                    result = result.Replace(@"\", @"/");
                return result;
            });

            nancyConventions.ViewLocationConventions.Add((viewName, model, context) =>
            {
                string result = Path.Combine("Views", viewName);
                if (!string.IsNullOrEmpty(result))
                    result = result.Replace(@"\",@"/");
                return result;
            });
		}

        protected override void RequestStartup(TinyIoCContainer requestContainer, IPipelines pipelines, NancyContext context)
        {
            //Console.WriteLine(context.Request.Url.ToString());
            base.RequestStartup(requestContainer, pipelines, context);

            // At request startup we modify the request pipelines to
            // include forms authentication - passing in our now request
            // scoped user name mapper.
            //
            // The pipelines passed in here are specific to this request,
            // so we can add/remove/update items in them as we please.

            var formsAuthConfiguration = new Nancy.Authentication.Forms.FormsAuthenticationConfiguration()
            {
                RedirectUrl = "~/login",
                CryptographyConfiguration= this._cryptographyConfiguration,
                UserMapper = requestContainer.Resolve<Nancy.Authentication.Forms.IUserMapper>(),
            };

            Nancy.Authentication.Forms.FormsAuthentication.Enable(pipelines, formsAuthConfiguration);
            
        }

		public static Func<NancyContext, string, Response> AddStaticResourcePath(string requestedPath, Assembly assembly, string namespacePrefix)
		{
			return (context, s) =>
			       	{
			       		var path = context.Request.Path;
						if (!path.StartsWith(requestedPath))
						{
							return null;
						}

						string resourcePath;
						string name;

						var adjustedPath = path.Substring(requestedPath.Length + 1);
						if (adjustedPath.IndexOf('/') >= 0)
						{
							name = Path.GetFileName(adjustedPath);
							resourcePath = namespacePrefix + "." + adjustedPath.Substring(0, adjustedPath.Length - name.Length - 1).Replace('/', '.');
						}
						else
						{
							name = adjustedPath;
							resourcePath = namespacePrefix;
						}
						return new EmbeddedFileResponse(assembly, resourcePath, name);
			       	};
		}
	}
}