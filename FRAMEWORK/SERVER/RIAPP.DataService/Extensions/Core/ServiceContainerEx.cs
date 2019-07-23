using RIAPP.DataService.Core.CodeGen;
using RIAPP.DataService.Core.Security;
using RIAPP.DataService.Utils;

namespace RIAPP.DataService.Core
{
    public static class ServiceContainerEx
    {
        public static IUserProvider GetUserProvider(this IServiceContainer container)
        {
            return container.GetRequiredService<IUserProvider>();
        }

        public static IAuthorizer<TService> GetAuthorizer<TService>(this IServiceContainer<TService> container)
             where TService : BaseDomainService
        {
            return container.GetRequiredService<IAuthorizer<TService>>();
        }

        public static IValueConverter<TService> GetValueConverter<TService>(this IServiceContainer<TService> container)
                 where TService : BaseDomainService
        {
            return container.GetRequiredService<IValueConverter<TService>>();
        }

        public static IDataHelper<TService> GetDataHelper<TService>(this IServiceContainer<TService> container)
             where TService : BaseDomainService
        {
            return container.GetRequiredService<IDataHelper<TService>>();
        }

        public static IValidationHelper<TService> GetValidationHelper<TService>(this IServiceContainer<TService> container)
             where TService : BaseDomainService
        {
            return container.GetRequiredService<IValidationHelper<TService>>();
        }

        public static IServiceOperationsHelper<TService> GetServiceHelper<TService>(this IServiceContainer<TService> container)
             where TService : BaseDomainService
        {
            return container.GetRequiredService<IServiceOperationsHelper<TService>>();
        }

        public static ICodeGenFactory<TService> GetCodeGenFactory<TService>(this IServiceContainer<TService> container)
             where TService : BaseDomainService
        {
            return container.GetRequiredService<ICodeGenFactory<TService>>();
        }

        public static IDataManagerContainer<TService> GetDataManagerContainer<TService>(this IServiceContainer<TService> container)
             where TService : BaseDomainService
        {
            return container.GetRequiredService<IDataManagerContainer<TService>>();
        }

        public static IValidatorContainer<TService> GetValidatorContainer<TService>(this IServiceContainer<TService> container)
             where TService : BaseDomainService
        {
            return container.GetRequiredService<IValidatorContainer<TService>>();
        }

        public static ICRUDOperationsUseCaseFactory<TService> GetCRUDOperationsUseCaseFactory<TService>(this IServiceContainer<TService> container)
             where TService : BaseDomainService
        {
            return container.GetRequiredService<ICRUDOperationsUseCaseFactory<TService>>();
        }

        public static IQueryOperationsUseCaseFactory<TService> GetQueryOperationsUseCaseFactory<TService>(this IServiceContainer<TService> container)
            where TService : BaseDomainService
        {
            return container.GetRequiredService<IQueryOperationsUseCaseFactory<TService>>();
        }

        public static IRefreshOperationsUseCaseFactory<TService> GetRefreshOperationsUseCaseFactory<TService>(this IServiceContainer<TService> container)
            where TService : BaseDomainService
        {
            return container.GetRequiredService<IRefreshOperationsUseCaseFactory<TService>>();
        }

        public static IInvokeOperationsUseCaseFactory<TService> GetInvokeOperationsUseCaseFactory<TService>(this IServiceContainer<TService> container)
            where TService : BaseDomainService
        {
            return container.GetRequiredService<IInvokeOperationsUseCaseFactory<TService>>();
        }
    }
}