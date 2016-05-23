using RIAPP.DataService.DomainService.Attributes;

namespace RIAppDemo.BLL.Models
{
    [TypeName("IAddressInfo2")]
    public class AddressInfo
    {
        public int AddressID { get; set; }
        public string AddressLine1 { get; set; }
        public string City { get; set; }
        public string StateProvince { get; set; }
        public string CountryRegion { get; set; }
    }
}