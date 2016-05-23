using System.Collections.Generic;
using System.Threading.Tasks;
using RIAPP.DataService.DomainService.Types;

namespace RIAPP.DataService.DomainService.Interfaces
{
    public interface IValidator
    {
        Task<IEnumerable<ValidationErrorInfo>> ValidateModelAsync(object model, string[] modifiedField);
    }

    public interface IValidator<TModel> : IValidator
    {
        Task<IEnumerable<ValidationErrorInfo>> ValidateModelAsync(TModel model, string[] modifiedField);
    }
}