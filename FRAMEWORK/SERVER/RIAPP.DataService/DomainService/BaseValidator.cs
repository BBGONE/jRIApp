using System.Collections.Generic;
using System.Threading.Tasks;
using RIAPP.DataService.DomainService.Interfaces;
using RIAPP.DataService.DomainService.Types;

namespace RIAPP.DataService.DomainService
{
    public abstract class BaseValidator<T> : IValidator<T>
        where T : class

    {
        protected RequestContext RequestContext
        {
            get { return RequestContext.Current; }
        }

        public ChangeType ChangeType
        {
            get { return RequestContext.CurrentRowInfo.changeType; }
        }

        public T Original
        {
            get { return RequestContext.GetOriginal<T>(); }
        }

        public Task<IEnumerable<ValidationErrorInfo>> ValidateModelAsync(object model, string[] modifiedField)
        {
            return ValidateModelAsync((T) model, modifiedField);
        }

        public abstract Task<IEnumerable<ValidationErrorInfo>> ValidateModelAsync(T model, string[] modifiedField);
    }
}