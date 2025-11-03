using System.ComponentModel.DataAnnotations;

namespace ConSec.Models.DTOs
{
    public class CreateCustoDto
    {
        [Required(ErrorMessage = "A descrição é obrigatória")]
        [StringLength(255, ErrorMessage = "A descrição deve ter no máximo 255 caracteres")]
        public string Descricao { get; set; }

        [Required(ErrorMessage = "O valor é obrigatório")]
        [Range(0.01, double.MaxValue, ErrorMessage = "O valor deve ser maior que zero")]
        public decimal Valor { get; set; }

        [Required(ErrorMessage = "A data de pagamento é obrigatória")]
        public DateTime DataPagamento { get; set; }

        [Required(ErrorMessage = "O tema de custo é obrigatório")]
        public int TemaCustoId { get; set; }

        [StringLength(500, ErrorMessage = "O comentário deve ter no máximo 500 caracteres")]
        public string? Comentario { get; set; }

        // Tipo será adicionado depois: "unico", "semanal", "mensal"
        [Required(ErrorMessage = "O tipo é obrigatório")]
        [StringLength(50)]
        public string Tipo { get; set; } = "unico";
    }
}
