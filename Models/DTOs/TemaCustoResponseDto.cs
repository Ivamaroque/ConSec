namespace ConSec.Models.DTOs
{
    public class TemaCustoResponseDto
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        public string? Descricao { get; set; }
        public string Cor { get; set; } = "#3498db";
        public string Icone { get; set; } = "label";
        public int UsuarioId { get; set; }
        public string UsuarioNome { get; set; }
    }
}
