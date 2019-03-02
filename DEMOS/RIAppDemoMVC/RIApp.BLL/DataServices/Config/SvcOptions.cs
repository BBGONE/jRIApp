using System;
using System.Security.Principal;

namespace RIAppDemo.BLL.DataServices.Config
{
    public class SvcOptions
    {
        public Func<IServiceProvider, IPrincipal> GetUser { get; set; }
    }
}
