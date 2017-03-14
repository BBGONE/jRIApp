using System;
using RIAPP.DataService.DomainService.Config;
using System.Collections.Generic;

namespace RIAPP.DataService.DomainService.Interfaces
{
    public interface IValidatorContainer
    {
        IValidator GetValidator(IServiceContainer services, Type modelType);
        IValidator<TModel> GetValidator<TModel>(IServiceContainer services);

        void RegisterValidator(Type ModelType, Type ValidatorType);

        void RegisterValidator<TModel, TValidator>()
            where TModel : class
            where TValidator : IValidator<TModel>;

        IEnumerable<ServiceTypeDescriptor> Descriptors { get; }
    }
}