using RIAPP.DataService.Annotations.CodeGen;

namespace RIAppDemo.BLL.Models
{
    [TypeName("ITestLookUpProduct")]
    public class LookUpProduct
    {
        public int ProductID { get; set; }
        public string Name { get; set; }
    }
}