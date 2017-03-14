using RIAPP.DataService.DomainService.Interfaces;
using RIAppDemo.BLL.Validators;
using RIAppDemo.DAL.EF;

namespace RIAppDemo.BLL.DataServices.Config
{
    public static class ValidatorConfig
    {
        public static void RegisterValidators(IValidatorContainer validators)
        {
            validators.RegisterValidator<Customer, CustomerValidator>();
            validators.RegisterValidator<Product, ProductValidator>();
        }
    }
}