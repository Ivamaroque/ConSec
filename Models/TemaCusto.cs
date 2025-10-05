using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConSec.Models
{
    [Table("TemasCusto")]
    public class TemaCusto
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Nome { get; set; } // Ex: "Ônibus", "Alimentação", "Carros"
    }
}