namespace Quotation.API.Dtos.Material;

public class MaterialOutputDto : MaterialInputDto
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; }
}