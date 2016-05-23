using System;

namespace RIAPP.DataService.DomainService.Interfaces
{
    public interface IValidatorContainer
    {
        IValidator GetValidator(RequestContext requestContext, Type modelType);
        IValidator<TModel> GetValidator<TModel>(RequestContext requestContext);
        void RegisterValidator<TModel>(Func<RequestContext, IValidator<TModel>> validatorFactory);
    }
}