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
    }
}
