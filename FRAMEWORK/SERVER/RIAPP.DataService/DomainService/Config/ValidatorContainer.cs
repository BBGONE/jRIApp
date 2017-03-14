using System;
using System.Collections.Concurrent;
using RIAPP.DataService.DomainService.Interfaces;
using System.Collections.Generic;

namespace RIAPP.DataService.DomainService.Config
{
    public class ValidatorContainer : IValidatorContainer
    {
        private readonly ConcurrentDictionary<Type, ServiceTypeDescriptor> _validators;

        public ValidatorContainer()
        {
            _validators = new ConcurrentDictionary<Type, ServiceTypeDescriptor>();
        }

        public IValidator GetValidator(IServiceContainer services, Type modelType)
        {
            ServiceTypeDescriptor descriptor;
            if (_validators.TryGetValue(modelType, out descriptor))
                return (IValidator)services.GetService(descriptor.ServiceType);
            return null;
        }

        public IValidator<TModel> GetValidator<TModel>(IServiceContainer services)
        {
            var res = GetValidator(services, typeof(TModel));
            return (IValidator<TModel>)res;
        }

        public void RegisterValidator(Type ModelType, Type ValidatorType)
        {
            Type unboundType = typeof(IValidator<>);
            Type[] argsType = { ModelType };
            Type serviceType = unboundType.MakeGenericType(argsType);

            ServiceTypeDescriptor descriptor = new ServiceTypeDescriptor
            {
                ImplementationType = ValidatorType,
                ServiceType = serviceType,
                ModelType = ModelType
            };

            _validators.TryAdd(ModelType, descriptor);
        }

        public void RegisterValidator<TModel, TValidator>()
            where TModel : class
            where TValidator : IValidator<TModel>
        {
            ServiceTypeDescriptor descriptor = new ServiceTypeDescriptor
            {
                ImplementationType = typeof(TValidator),
                ServiceType = typeof(IValidator<TModel>),
                ModelType = typeof(TModel)
            };

            _validators.TryAdd(typeof(TModel), descriptor);
        }

        public IEnumerable<ServiceTypeDescriptor> Descriptors { get { return _validators.Values; } }
    }
}