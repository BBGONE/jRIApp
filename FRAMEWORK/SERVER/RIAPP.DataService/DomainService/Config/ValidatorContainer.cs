using System;
using System.Collections.Concurrent;
using RIAPP.DataService.DomainService.Interfaces;

namespace RIAPP.DataService.DomainService.Config
{
    public class ValidatorContainer : IValidatorContainer
    {
        private readonly ConcurrentDictionary<Type, Func<RequestContext, IValidator>> _validators;

        public ValidatorContainer()
        {
            _validators = new ConcurrentDictionary<Type, Func<RequestContext, IValidator>>();
        }

        public IValidator GetValidator(RequestContext requestContext, Type modelType)
        {
            Func<RequestContext, IValidator> factory;
            if (_validators.TryGetValue(modelType, out factory))
                return factory(requestContext);
            return null;
        }

        public IValidator<TModel> GetValidator<TModel>(RequestContext requestContext)
        {
            var res = GetValidator(requestContext, typeof(TModel));
            return (IValidator<TModel>) res;
        }

        public void RegisterValidator<TModel>(Func<RequestContext, IValidator<TModel>> validatorFactory)
        {
            _validators.TryAdd(typeof(TModel), validatorFactory);
        }
    }
}