using Microsoft.EntityFrameworkCore;
using Quotation.Data.Abstract;
using Quotation.Data.Contexts;
using Quotation.Domain.Models;

namespace Quotation.Data.Concrete;

public class MaterialRepository : BaseRepository<Material, int>, IMaterialRepository
{
    public MaterialRepository(PostgreSqlContext dbContext) : base(dbContext)
    {
    }

    public async Task<Material?> GetByNameAsync(string name)
    {
        var entity = await _dbContext.Set<Material>()
            .Where(m => m.Name.Equals(name))
            .FirstOrDefaultAsync();
        return entity is { IsDeleted: false } ? entity : null;
    }
}