using RIAPP.DataService.Core.Exceptions;
using RIAPP.DataService.Utils;
using System;

namespace RIAPP.DataService.Core.Metadata
{

    public static class MetadataHelper
    {
        private static readonly MetadataCache _metadataCache = new MetadataCache();

        public static RunTimeMetadata GetInitializedMetadata(BaseDomainService domainService,
            IDataHelper dataHelper,
            IValueConverter valueConverter)
        {
            RunTimeMetadata result = _metadataCache.GetOrAdd(domainService.GetType(), (svcType) =>
            {
                RunTimeMetadata runTimeMetadata = null;

                try
                {
                    DesignTimeMetadata designTimeMetadata = ((IMetaDataProvider)domainService).GetDesignTimeMetadata(false);
                    IDataManagerContainer dataManagerContainer = domainService.ServiceContainer.DataManagerContainer;
                    runTimeMetadata = _InitMetadata(domainService, designTimeMetadata, dataHelper, valueConverter, dataManagerContainer);
                }
                catch (Exception ex)
                {
                    domainService._OnError(ex);
                    throw new DummyException(ex.Message, ex);
                }

                return runTimeMetadata;
            });

            return result;
        }

        private static RunTimeMetadata _InitMetadata(BaseDomainService domainService,
            DesignTimeMetadata designTimeMetadata,
            IDataHelper dataHelper,
            IValueConverter valueConverter,
            IDataManagerContainer dataManagerContainer)
        {
            RunTimeMetadataBuilder runTimeMetadataBuilder = new RunTimeMetadataBuilder(domainService.GetType(), designTimeMetadata, dataHelper, valueConverter, dataManagerContainer);

            try
            {
                return runTimeMetadataBuilder.Build();
            }
            catch (Exception ex)
            {
                domainService._OnError(ex);
                throw new DummyException(ex.Message, ex);
            }
        }
    }
}