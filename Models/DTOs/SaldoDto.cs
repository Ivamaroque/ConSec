using System.ComponentModel.DataAnnotations;

namespace ConSec.Models.DTOs
{
    public class CreateSaldoDto
    {
        [Required(ErrorMessage = "Descrição é obrigatória")]
        [StringLength(200)]
        public string Descricao { get; set; } = string.Empty;

        [Required(ErrorMessage = "Valor é obrigatório")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Valor deve ser maior que zero")]
        public decimal Valor { get; set; }

        [Required(ErrorMessage = "Data de entrada é obrigatória")]
        public DateTime DataEntrada { get; set; }
    }

    public class UpdateSaldoDto
    {
        [StringLength(200)]
        public string? Descricao { get; set; }

        [Range(0.01, double.MaxValue, ErrorMessage = "Valor deve ser maior que zero")]
        public decimal? Valor { get; set; }

        public DateTime? DataEntrada { get; set; }
    }

    public class SaldoResponseDto
    {
        public int Id { get; set; }
        public string Descricao { get; set; } = string.Empty;
        public decimal Valor { get; set; }
        public DateTime DataEntrada { get; set; }
        public string? ArquivoAnexoPath { get; set; }
        public int UsuarioId { get; set; }
        public string UsuarioNome { get; set; } = string.Empty;
        public DateTime CriadoEm { get; set; }
    }
}
