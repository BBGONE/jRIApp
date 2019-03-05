using System;
using System.Collections.Generic;

namespace RIAPP.DataService.Core.Config
{
    public interface IValidatorRegister
    {
        bool TryGetDescriptor(Type modelType, out ServiceTypeDescriptor descriptor);

        void RegisterValidator(Type ModelType, Type ValidatorType);

        void RegisterValidator<TModel, TValidator>()
            where TModel : class
            where TValidator : IValidator<TModel>;

        IEnumerable<ServiceTypeDescriptor> Descriptors { get; }

    }
}