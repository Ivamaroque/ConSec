namespace ConSec.Models.DTOs
{
    public class CustoResponseDto
    {
        public int Id { get; set; }
        public string Descricao { get; set; } = string.Empty;
        public decimal Valor { get; set; }
        public DateTime DataPagamento { get; set; }
        public string Tipo { get; set; } = string.Empty;
        public string? Comentario { get; set; }
        public string? ArquivoAnexoPath { get; set; }
        
        // Informações do Tema
        public int TemaCustoId { get; set; }
        public string TemaCustoNome { get; set; } = string.Empty;
        public string TemaCustoCor { get; set; } = "#3498db";
        
        // Informações do Usuário
        public int UsuarioId { get; set; }
        public string UsuarioNome { get; set; } = string.Empty;
        public string UsuarioEmail { get; set; } = string.Empty;
    }
}
