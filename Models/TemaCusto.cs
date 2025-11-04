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

        [StringLength(500)]
        public string? Descricao { get; set; }

        // Cor do tema em hexadecimal (ex: #FF5733)
        [StringLength(7)]
        public string Cor { get; set; } = "#3498db"; // Cor padrão azul

        // Ícone do Material Icons (ex: "directions_bus", "restaurant", "directions_car")
        [StringLength(50)]
        public string? Icone { get; set; } = "label"; // Ícone padrão

        // Relacionamento com Usuario (funcionário que pode usar este tema)
        public int? UsuarioId { get; set; }
        
        [ForeignKey("UsuarioId")]
        public Usuario? Usuario { get; set; }
    }
}