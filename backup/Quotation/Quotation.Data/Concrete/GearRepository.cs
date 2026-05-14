using Quotation.Data.Abstract;
using Quotation.Data.Contexts;
using Quotation.Domain.Models;

namespace Quotation.Data.Concrete;

public class GearRepository : BaseRepository<Gear, int>, IGearRepository
{
    public GearRepository(PostgreSqlContext dbContext) : base(dbContext)
    {
    }
}