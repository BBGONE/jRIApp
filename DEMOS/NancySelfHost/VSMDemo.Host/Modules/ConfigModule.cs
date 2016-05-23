using Nancy;
using Nancy.ModelBinding;
using VSMDemo.Host.ViewModels;

namespace VSMDemo.Host.Modules
{
	public class ConfigModule : NancyModule
	{
		private const string MessageKey = "message";
		private const string ConfigInfoKey = "ci";

		public ConfigModule()
			: base("/config")
		{
			Get["/"] = x =>
						{
							var message = Session[MessageKey] != null ? Session[MessageKey].ToString() : string.Empty;
							var model = new ConfigStatusModel
											{
												Message = message,
												Config = Session[ConfigInfoKey] == null ? new ConfigInfo() : (ConfigInfo)Session[ConfigInfoKey],
											};
							Session[MessageKey] = string.Empty;
							return View["index.html", model];
						};
			Post["/update"] = parameters =>
								{
									var config = this.Bind<ConfigInfo>();

									// save information

									Session[MessageKey] = "Configuration Updated";
									Session[ConfigInfoKey] = config;
									return Response.AsRedirect("/config");
								};
		}
	}

	public class ConfigStatusModel
	{
		public string Message { get; set; }
		public ConfigInfo Config { get; set; }
		public bool HasMessage
		{
			get { return !string.IsNullOrWhiteSpace(Message); }
		}
	}
}
