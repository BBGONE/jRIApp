using RIAPP.DataService.DomainService.Attributes;

namespace RIAppDemo.BLL.Models
{
    [TypeName("ITestLookUpProduct")]
    public class LookUpProduct
    {
        public int ProductID { get; set; }
        public string Name { get; set; }
    }
}