using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RIAppDemo.DAL.EF
{
    [Table("SalesLT.vProductAndDescription")]
    public class vProductAndDescription
    {
        [Key]
        [Column(Order = 0)]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int ProductID { get; set; }

        [Key]
        [Column(Order = 1)]
        [StringLength(50)]
        public string Name { get; set; }

        [Key]
        [Column(Order = 2)]
        [StringLength(50)]
        public string ProductModel { get; set; }

        [Key]
        [Column(Order = 3)]
        [StringLength(6)]
        public string Culture { get; set; }

        [Key]
        [Column(Order = 4)]
        [StringLength(400)]
        public string Description { get; set; }
    }
}