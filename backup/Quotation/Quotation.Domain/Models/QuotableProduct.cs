namespace Quotation.Domain.Models;

public abstract class QuotableProduct : BaseEntity<int>
{
    public int MaterialId { get; set; }
    public string? UserId { get; set; } 
    public double Price { get; set; }
    
    public Material Material { get; set; }
}