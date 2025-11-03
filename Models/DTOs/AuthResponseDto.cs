namespace ConSec.Models.DTOs
{
    public class AuthResponseDto
    {
        public string Token { get; set; }
        public int Id { get; set; }
        public string Nome { get; set; }
        public string Email { get; set; }
        public string Cargo { get; set; }
        public DateTime ExpiresAt { get; set; }
    }
}
