using RIAPP.DataService.Core.Config;
using RIAppDemo.BLL.Validators;
using RIAppDemo.DAL.EF;

namespace RIAppDemo.BLL.DataServices.Config
{
    public static class ValidatorConfig
    {
        public static void RegisterValidators(IValidatorRegister validators)
        {
            validators.RegisterValidator<Customer, CustomerValidator>();
            // validators.RegisterValidator<Product, ProductValidator>();
            // just for for testing  - using raw types
            validators.RegisterValidator(typeof(Product), typeof(ProductValidator));
        }
    }
}