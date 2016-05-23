using RIAPP.DataService.DomainService.Interfaces;
using RIAPP.DataService.Utils;

namespace RIAPP.DataService.DomainService.Config
{
    public class ServiceConfig
    {
        private readonly CachedMetadata _metadata;

        public ServiceConfig(CachedMetadata metadata)
        {
            _metadata = metadata;
        }

        public IValidatorContainer ValidatorsContainer
        {
            get { return _metadata.ValidatorsContainer; }
        }

        public IDataManagerContainer DataManagerContainer
        {
            get { return _metadata.DataManagerContainer; }
        }
    }
}