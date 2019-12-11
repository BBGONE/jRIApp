using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
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
