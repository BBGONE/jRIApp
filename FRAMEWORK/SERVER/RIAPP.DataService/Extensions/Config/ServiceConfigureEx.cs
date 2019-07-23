using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using RIAPP.DataService.Core.CodeGen;
using RIAPP.DataService.Core.Config;
using RIAPP.DataService.Core.Security;
using RIAPP.DataService.Core.Types;
using RIAPP.DataService.Resources;
using RIAPP.DataService.Utils;
using System;
using System.Threading.Tasks;

namespace RIAPP.DataService.Core.Config
{
    public static class ServiceConfigureEx
    {
        public static void AddDomainService<TService>(this IServiceCollection services,
            Action<ServiceOptions> configure)
         where TService : BaseDomainService
        {
            ServiceOptions options = new ServiceOptions(services);
            configure?.Invoke(options);

            var getUser = options.UserFactory ?? throw new ArgumentNullException(nameof(options.UserFactory), ErrorStrings.ERR_NO_USER);

            services.TryAddScoped<IUserProvider>((sp) => new UserProvider(() => getUser(sp)));

            services.TryAddScoped<IAuthorizer<TService>, Authorizer<TService>>();

            services.TryAddScoped<IValueConverter<TService>, ValueConverter<TService>>();

            services.TryAddScoped<IDataHelper<TService>, DataHelper<TService>>();

            services.TryAddScoped<IValidationHelper<TService>, ValidationHelper<TService>>();

            services.TryAddScoped<IServiceOperationsHelper<TService>, ServiceOperationsHelper<TService>>();

            foreach (var descriptor in options.DataManagerRegister.Descriptors)
            {
                services.TryAddScoped(descriptor.ServiceType, descriptor.ImplementationType);
            }

            foreach (var descriptor in options.ValidatorRegister.Descriptors)
            {
                services.TryAddScoped(descriptor.ServiceType, descriptor.ImplementationType);
            }

            services.TryAddScoped<IDataManagerContainer<TService>>((sp) => {
                var serviceContainer = sp.GetRequiredService<IServiceContainer<TService>>();
                return new DataManagerContainer<TService>(serviceContainer, options.DataManagerRegister);
            });

            services.TryAddScoped<IValidatorContainer<TService>>((sp) => {
                var serviceContainer = sp.GetRequiredService<IServiceContainer<TService>>();
                return new ValidatorContainer<TService>(serviceContainer, options.ValidatorRegister);
            });

            services.TryAddScoped<IServiceContainer<TService>, ServiceContainer<TService>>();

            #region  CodeGen

            services.TryAddScoped<ICodeGenFactory<TService>, CodeGenFactory<TService>>();

            services.AddScoped<ICodeGenProviderFactory<TService>>((sp) => {
                return new XamlProviderFactory<TService>();
            });

            services.AddScoped<ICodeGenProviderFactory<TService>>((sp) => {
                var sc = sp.GetRequiredService<IServiceContainer<TService>>();
                return new TypeScriptProviderFactory<TService>(sc, options.ClientTypes);
            });

            #endregion

            #region UseCases
            var crudCaseFactory = ActivatorUtilities.CreateFactory(typeof(CRUDOperationsUseCase<TService>), new System.Type[] { typeof(BaseDomainService), typeof(Action<Exception>), typeof(Action<RowInfo>), typeof(Func<Task>) });

            services.TryAddScoped<ICRUDOperationsUseCaseFactory<TService>>((sp) => new CRUDOperationsUseCaseFactory<TService>((svc, onError, trackChanges, executeChangeSet) =>
                (ICRUDOperationsUseCase<TService>)crudCaseFactory(sp, new object[] { svc, onError, trackChanges, executeChangeSet })));

            var queryCaseFactory = ActivatorUtilities.CreateFactory(typeof(QueryOperationsUseCase<TService>), new System.Type[] { typeof(BaseDomainService), typeof(Action<Exception>) });

            services.TryAddScoped<IQueryOperationsUseCaseFactory<TService>>((sp) => new QueryOperationsUseCaseFactory<TService>((svc, onError) =>
                (IQueryOperationsUseCase<TService>)queryCaseFactory(sp, new object[] { svc, onError })));

            var refreshCaseFactory = ActivatorUtilities.CreateFactory(typeof(RefreshOperationsUseCase<TService>), new System.Type[] { typeof(BaseDomainService), typeof(Action<Exception>) });

            services.TryAddScoped<IRefreshOperationsUseCaseFactory<TService>>((sp) => new RefreshOperationsUseCaseFactory<TService>((svc, onError) =>
                (IRefreshOperationsUseCase<TService>)refreshCaseFactory(sp, new object[] { svc, onError })));

            var invokeCaseFactory = ActivatorUtilities.CreateFactory(typeof(InvokeOperationsUseCase<TService>), new System.Type[] { typeof(BaseDomainService), typeof(Action<Exception>) });

            services.TryAddScoped<IInvokeOperationsUseCaseFactory<TService>>((sp) => new InvokeOperationsUseCaseFactory<TService>((svc, onError) =>
                (IInvokeOperationsUseCase<TService>)invokeCaseFactory(sp, new object[] { svc, onError })));

            services.TryAddTransient(typeof(IResponsePresenter<,>), typeof(OperationOutput<,>));
            #endregion

            var serviceFactory = ActivatorUtilities.CreateFactory(typeof(TService), new Type[] { typeof(IServiceContainer<TService>) });

            services.TryAddScoped<TService>((sp) => {
                var sc = sp.GetRequiredService<IServiceContainer<TService>>();
                return (TService)serviceFactory(sp, new object[] { sc });
            });
        }
    }
}