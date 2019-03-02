using Net451.Microsoft.Extensions.DependencyInjection;
using Net451.Microsoft.Extensions.DependencyInjection.Extensions;
using RIAppDemo.BLL.Utils;

namespace RIAppDemo.BLL.DataServices.Config
{
    public static class ThumbnailServiceConfig
    {
        public static void AddThumbnailService(this IServiceCollection services)
        {
            services.TryAddScoped<IThumbnailService, ThumbnailService>();
        }
    }
}
