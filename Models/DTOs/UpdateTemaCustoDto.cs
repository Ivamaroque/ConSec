using System.ComponentModel.DataAnnotations;

namespace ConSec.Models.DTOs
{
    public class UpdateTemaCustoDto
    {
        [Required(ErrorMessage = "O ID é obrigatório")]
        public int Id { get; set; }

        [Required(ErrorMessage = "O nome do tema é obrigatório")]
        [StringLength(100, ErrorMessage = "O nome deve ter no máximo 100 caracteres")]
        public string Nome { get; set; }

        [StringLength(500, ErrorMessage = "A descrição deve ter no máximo 500 caracteres")]
        public string? Descricao { get; set; }

        [StringLength(7, ErrorMessage = "A cor deve estar no formato hexadecimal (#RRGGBB)")]
        public string? Cor { get; set; }

        [StringLength(50, ErrorMessage = "O ícone deve ter no máximo 50 caracteres")]
        public string? Icone { get; set; }

        public int? UsuarioId { get; set; }
    }
}
