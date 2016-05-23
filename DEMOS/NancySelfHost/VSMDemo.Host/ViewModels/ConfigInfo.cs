using System;

namespace VSMDemo.Host.ViewModels
{
	[Serializable]
	public class ConfigInfo
	{
		public int UpdateInterval { get; set; }
		public string ServerName { get; set; }
	}
}
