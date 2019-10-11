using System;
using System.Security.Claims;

namespace RIAppDemo.BLL.DataServices.Config
{
    public class SvcOptions
    {
        public Func<IServiceProvider, ClaimsPrincipal> GetUser { get; set; }
    }
}
