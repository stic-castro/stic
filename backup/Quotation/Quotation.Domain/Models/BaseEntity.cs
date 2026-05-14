namespace Quotation.Domain.Models;

public abstract class BaseEntity <TId>
{
    public TId Id { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime CreatedAt { get; set; }
}