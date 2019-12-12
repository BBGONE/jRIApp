using RIAPP.DataService.Core.Types;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RIAPP.DataService.Core
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