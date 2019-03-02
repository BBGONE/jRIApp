using RIAPP.DataService.Utils;
using System;
using System.Security.Principal;

namespace RIAppDemo.BLL.DataServices.Config
{
    public class SvcOptions
    {
        public Func<IServiceProvider, ISerializer> GetSerializer { get; set; }
        public Func<IServiceProvider, IPrincipal> GetUser { get; set; }
    }
}
