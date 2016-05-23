using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RIAppDemo.DAL.EF
{
    [Table("SalesLT.vGetAllCategories")]
    public class vGetAllCategory
    {
        [Key]
        [StringLength(50)]
        public string ParentProductCategoryName { get; set; }

        [StringLength(50)]
        public string ProductCategoryName { get; set; }

        public int? ProductCategoryID { get; set; }
    }
}