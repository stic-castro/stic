namespace Quotation.API.Dtos.Pulley;

public class PulleyOutputDto : PulleyInputDto
{
    public int Id { get; set; }
    public double Price { get; set; }
    public string? UserId { get; set; } 
}