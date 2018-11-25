using Microsoft.Extensions.DependencyInjection;
using RIAPP.DataService.Utils.Extensions;
using RIAPP.DataService.Utils.Interfaces;
using RIAppDemo.DAL.EF;
using System;
using System.Security.Principal;

namespace RIAppDemo.BLL.DataServices.Config
{
    public static class RIAppDemoServiceEFConfig
    {
        public static void AddRIAppDemoService(this IServiceCollection services, Func<ISerializer> getSerializer, Func<IPrincipal> getUser)
        {
            services.AddDomainService<RIAppDemoServiceEF>(getSerializer, getUser, (options) => {
                ValidatorConfig.RegisterValidators(options.ValidatorsContainer);
                DataManagerConfig.RegisterDataManagers(options.DataManagerContainer);

                services.AddScoped<ADWDbContext>((sp) => {
                    var res = new ADWDbContext(sp.GetRequiredService<DBConnectionFactory>().GetRIAppDemoConnection());
                    return res;
                });
            });
        }
    }
}
