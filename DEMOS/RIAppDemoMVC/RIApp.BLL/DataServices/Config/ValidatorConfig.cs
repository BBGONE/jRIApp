using RIAppDemo.BLL.Validators;
using RIAPP.DataService.DomainService.Interfaces;

namespace RIAppDemo.BLL.DataServices.Config
{
    public static class ValidatorConfig
    {
        public static void RegisterValidators(IValidatorContainer validators)
        {
            validators.RegisterValidator(reqContext => { return new CustomerValidator(); });
            validators.RegisterValidator(reqContext => { return new ProductValidator(); });
        }
    }
}