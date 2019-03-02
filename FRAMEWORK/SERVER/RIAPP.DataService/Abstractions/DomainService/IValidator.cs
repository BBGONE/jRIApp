using RIAPP.DataService.DomainService.Types;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RIAPP.DataService.DomainService
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