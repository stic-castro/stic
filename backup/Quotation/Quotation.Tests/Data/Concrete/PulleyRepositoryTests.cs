namespace Quotation.Tests.Data.Concrete;

using Microsoft.EntityFrameworkCore;
using Quotation.Data.Concrete;
using Quotation.Data.Contexts;
using Quotation.Domain.Models;

public class PulleyRepositoryTests
{
    [Fact]
    public async Task SoftDeleteAsync_MarksEntityAsDeletedAndReturnsAffectedRows()
    {
        await using var context = CreateContext();
        var material = new Material
        {
            Name = "Steel",
            Density = 7850,
            PricePerKg = 10,
            PricePerHourMachine = 5,
            PricePerHourOperator = 4
        };
        var pulley = new Pulley
        {
            OuterDiameter = 120,
            InnerBoreDiameter = 25,
            Width = 2,
            GrooveCount = 2,
            GrooveType = 'A',
            Price = 100,
            Material = material
        };

        context.Add(pulley);
        await context.SaveChangesAsync();

        var repository = new PulleyRepository(context);

        var affectedRows = await repository.SoftDeleteAsync(pulley.Id);

        Assert.True(affectedRows > 0);
        Assert.Null(await repository.GetByIdAsync(pulley.Id));
        Assert.True(await context.Set<Pulley>().IgnoreQueryFilters().AnyAsync(p => p.Id == pulley.Id && p.IsDeleted));
    }

    [Fact]
    public async Task SoftDeleteAsync_ReturnsZero_WhenEntityDoesNotExist()
    {
        await using var context = CreateContext();
        var repository = new PulleyRepository(context);

        var affectedRows = await repository.SoftDeleteAsync(404);

        Assert.Equal(0, affectedRows);
    }

    private static PostgreSqlContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<PostgreSqlContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new PostgreSqlContext(options);
    }
}
