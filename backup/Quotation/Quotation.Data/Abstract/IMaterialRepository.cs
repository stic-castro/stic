using Quotation.Domain.Models;

namespace Quotation.Data.Abstract;

public interface IMaterialRepository : IBaseRepository<Material, int>
{
    Task<Material?> GetByNameAsync(string name);
}