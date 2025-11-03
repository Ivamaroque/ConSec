using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConSec.Models
{
    [Table("Custos")]
    public class Custo
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(255)]
        public string Descricao { get; set; }

        [Required]
        [Column(TypeName = "decimal(10, 2)")] // Ótimo para valores monetários
        public decimal Valor { get; set; }

        [Required]
        [StringLength(50)]
        public string Tipo { get; set; } // "Padrão", "Semanal", "Mensal"

        [Required]
        public DateTime DataPagamento { get; set; }

        [StringLength(500)]
        public string? Comentario { get; set; } // Comentário opcional

        [StringLength(255)]
        public string? ArquivoAnexoPath { get; set; } // '?' torna o campo opcional

        // --- Chaves Estrangeiras (Relacionamentos) ---

        // Relacionamento com Usuario
        public int UsuarioId { get; set; } // A chave estrangeira
        [ForeignKey("UsuarioId")]
        public virtual Usuario? Usuario { get; set; } // Propriedade de Navegação

        // Relacionamento com TemaCusto
        public int TemaCustoId { get; set; } // A chave estrangeira
        [ForeignKey("TemaCustoId")]
        public virtual TemaCusto? TemaCusto { get; set; } // Propriedade de Navegação
    }
}