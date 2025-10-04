using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConSec.Models
{
    // Define o nome da tabela no banco de dados.
    [Table("Usuarios")]
    public class Usuario
    {
        [Key] // Marca a propriedade 'Id' como a chave primária da tabela.
        public int Id { get; set; }

        [Required] // Garante que o campo 'Nome' não pode ser nulo.
        [StringLength(100)] // Define o tamanho máximo da string.
        public string Nome { get; set; }

        [Required]
        [StringLength(150)]
        public string Email { get; set; }

        [Required]
        public string Senha { get; set; } // Lembre-se, aqui guardaremos o hash!

        [Required]
        public string Cargo { get; set; } // "gestor" ou "funcionário"

        // Propriedades para controle de data (boas práticas)
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}