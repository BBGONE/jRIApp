using System;

namespace RIAPP.DataService.Core
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