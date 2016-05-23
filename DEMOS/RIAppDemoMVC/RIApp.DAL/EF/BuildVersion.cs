using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RIAppDemo.DAL.EF
{
    [Table("BuildVersion")]
    public class BuildVersion
    {
        [Key]
        [Column(Order = 0)]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public byte SystemInformationID { get; set; }

        [Key]
        [Column("Database Version", Order = 1)]
        [StringLength(25)]
        public string Database_Version { get; set; }

        [Key]
        [Column(Order = 2)]
        public DateTime VersionDate { get; set; }

        [Key]
        [Column(Order = 3)]
        public DateTime ModifiedDate { get; set; }
    }
}