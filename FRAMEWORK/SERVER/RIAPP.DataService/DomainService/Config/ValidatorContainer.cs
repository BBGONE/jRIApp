using System;
using System.Collections.Concurrent;
using RIAPP.DataService.DomainService.Interfaces;
using System.Collections.Generic;

namespace RIAPP.DataService.DomainService.Config
{
    public class ValidatorContainer : IValidatorContainer
    {
        private readonly ConcurrentDictionary<Type, SvcDescriptor> _validators;

        public ValidatorContainer()
        {
            _validators = new ConcurrentDictionary<Type, SvcDescriptor>();
        }

        public IValidator GetValidator(IServiceContainer services, Type modelType)
        {
            SvcDescriptor descriptor;
            if (_validators.TryGetValue(modelType, out descriptor))
                return (IValidator)services.GetService(descriptor.ServiceType);
            return null;
        }

        public IValidator<TModel> GetValidator<TModel>(IServiceContainer services)
        {
            var res = GetValidator(services, typeof(TModel));
            return (IValidator<TModel>)res;
        }

        public void RegisterValidator<TModel, TValidator>()
            where TModel : class
            where TValidator : IValidator<TModel>
        {
            SvcDescriptor descriptor = new SvcDescriptor
            {
                ImplementationType = typeof(TValidator),
                ServiceType = typeof(IValidator<TModel>),
                ModelType = typeof(TModel)
            };

            _validators.TryAdd(typeof(TModel), descriptor);
        }

        public IEnumerable<SvcDescriptor> Descriptors { get { return _validators.Values; } }
    }
}