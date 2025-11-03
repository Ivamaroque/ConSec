namespace ConSec.Models.DTOs
{
    public class TemaCustoResponseDto
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        public int TotalCustos { get; set; }
        public decimal ValorTotal { get; set; }
    }
}
