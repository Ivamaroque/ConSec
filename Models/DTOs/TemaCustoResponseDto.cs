namespace ConSec.Models.DTOs
{
    public class TemaCustoResponseDto
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        public string? Descricao { get; set; }
        public string Cor { get; set; } = "#3498db";
        public string Icone { get; set; } = "label";
        
        // Campos antigos - mantidos para compatibilidade
        public int UsuarioId { get; set; }
        public string UsuarioNome { get; set; } = string.Empty;
        
        // Novo campo - lista de usuários associados
        public List<UsuarioSimplificadoDto>? Usuarios { get; set; }
    }

    public class UsuarioSimplificadoDto
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }
}
