using System;

namespace RIAPP.DataService.DomainService
{
    public interface IValidatorContainer
    {
        IValidator GetValidator(Type modelType);
        IValidator<TModel> GetValidator<TModel>();
    }

    public interface IValidatorContainer<TService>: IValidatorContainer
        where TService: BaseDomainService
    {
    }
}