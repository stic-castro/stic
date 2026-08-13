using Microsoft.EntityFrameworkCore;

namespace Quotation.Data.Contexts;

public class PostgreSqlContext : DbContext
{
    public PostgreSqlContext(DbContextOptions<PostgreSqlContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.ApplyConfigurationsFromAssembly(typeof(PostgreSqlContext).Assembly);
        base.OnModelCreating(builder);
    }
}