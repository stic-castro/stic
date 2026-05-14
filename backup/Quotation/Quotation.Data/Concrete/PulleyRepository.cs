using Quotation.Data.Abstract;
using Quotation.Data.Contexts;
using Quotation.Domain.Models;

namespace Quotation.Data.Concrete;

public class PulleyRepository : BaseRepository<Pulley, int>, IPulleyRepository
{
    public PulleyRepository(PostgreSqlContext dbContext) : base(dbContext)
    {
    }
}