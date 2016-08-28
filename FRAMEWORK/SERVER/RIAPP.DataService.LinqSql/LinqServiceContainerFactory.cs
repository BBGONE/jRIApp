using RIAPP.DataService.Utils.Interfaces;
using RIAPP.DataService.DomainService;
using RIAPP.DataService.LinqSql.Utils;

namespace RIAPP.DataService.LinqSql
{

    public class LinqServiceContainerFactory : ServiceContainerFactory
    {
        protected override IValueConverter CreateValueConverter(ISerializer serializer)
        {
            return new LinqValueConverter(serializer);
        }

    }
}
