﻿using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Pipeline;
using RIAPP.DataService.Core.CodeGen;
using RIAPP.DataService.Core.Config;
using RIAPP.DataService.Core.Security;
using RIAPP.DataService.Core.UseCases;
using RIAPP.DataService.Core.UseCases.CRUDMiddleware;
using RIAPP.DataService.Core.UseCases.InvokeMiddleware;
using RIAPP.DataService.Core.UseCases.QueryMiddleware;
using RIAPP.DataService.Core.UseCases.RefreshMiddleware;
using RIAPP.DataService.Resources;
using RIAPP.DataService.Utils;
using System;

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

            services.TryAddSingleton<IValueConverter<TService>, ValueConverter<TService>>();

            services.TryAddSingleton<IDataHelper<TService>, DataHelper<TService>>();

            services.TryAddSingleton<IValidationHelper<TService>, ValidationHelper<TService>>();

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

            #region Pipeline

            services.TryAddSingleton((sp) => {
                var builder = new PipelineBuilder<TService, CRUDContext<TService>>(sp);
                Configuration.ConfigureCRUD(builder);
                return builder.Build();
            });

            services.TryAddSingleton((sp) => {
                var builder = new PipelineBuilder<TService, QueryContext<TService>>(sp);
                Configuration.ConfigureQuery(builder);
                return builder.Build();
            });

            services.TryAddSingleton((sp) => {
                var builder = new PipelineBuilder<TService, InvokeContext<TService>>(sp);
                Configuration.ConfigureInvoke(builder);
                return builder.Build();
            });

            services.TryAddSingleton((sp) => {
                var builder = new PipelineBuilder<TService, RefreshContext<TService>>(sp);
                Configuration.ConfigureRefresh(builder);
                return builder.Build();
            });

            #endregion

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
            var crudCaseFactory = ActivatorUtilities.CreateFactory(typeof(CRUDOperationsUseCase<TService>), 
                new System.Type[] { typeof(BaseDomainService), 
                typeof(CRUDServiceMethods)
            });

            services.TryAddScoped<ICRUDOperationsUseCaseFactory<TService>>((sp) => new CRUDOperationsUseCaseFactory<TService>((svc, serviceMethods) =>
                (ICRUDOperationsUseCase<TService>)crudCaseFactory(sp, new object[] { svc, serviceMethods })));

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

            services.TryAddScoped<IServiceContainer<TService>, ServiceContainer<TService>>();

            var serviceFactory = ActivatorUtilities.CreateFactory(typeof(TService), 
                new Type[] { typeof(IServiceContainer<TService>) } );
            
            services.TryAddScoped<TService>((sp) => {
                var sc = sp.GetRequiredService<IServiceContainer<TService>>();
                return (TService)serviceFactory(sp, new object[] { sc });
            });
        }
    }
}