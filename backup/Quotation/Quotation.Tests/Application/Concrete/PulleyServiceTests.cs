namespace Quotation.Tests.Application.Concrete;

using Moq;
using Quotation.Application.Concrete;
using Quotation.Data.Abstract;
using Quotation.Domain.Models;

public class PulleyServiceTests
{
    private readonly Mock<IPulleyRepository> _pulleyRepoMock = new();
    private readonly Mock<IMaterialRepository> _materialRepoMock = new();
    private readonly PulleyService _service;

    public PulleyServiceTests()
    {
        _service = new PulleyService(_pulleyRepoMock.Object, _materialRepoMock.Object);
    }

    [Fact]
    public async Task CalculatePrice_ReturnsNull_WhenMaterialDoesNotExist()
    {
        _materialRepoMock.Setup(r => r.GetByNameAsync("Unknown")).ReturnsAsync((Material?)null);

        var result = await _service.CalculatePrice("Unknown", 120, 25, 2, 3, 'A');

        Assert.Null(result);
        _pulleyRepoMock.Verify(r => r.CreateAsync(It.IsAny<Pulley>()), Times.Never);
    }

    [Fact]
    public async Task CalculatePrice_CreatesPulley_WithExpectedValuesAndPrice()
    {
        var material = new FixedWeightMaterial(2)
        {
            Id = 3,
            Name = "Bronze",
            PricePerKg = 80,
            PricePerHourMachine = 35,
            PricePerHourOperator = 25
        };

        _materialRepoMock.Setup(r => r.GetByNameAsync("Bronze")).ReturnsAsync(material);
        _pulleyRepoMock.Setup(r => r.CreateAsync(It.IsAny<Pulley>())).ReturnsAsync((Pulley p) => p);

        var result = await _service.CalculatePrice("Bronze", 120, 25, 2, 3, 'B');

        Assert.NotNull(result);
        Assert.Equal(120, result.OuterDiameter);
        Assert.Equal(25, result.InnerBoreDiameter);
        Assert.Equal(2, result.Width);
        Assert.Equal(3, result.GrooveCount);
        Assert.Equal('B', result.GrooveType);
        Assert.Equal(3, result.MaterialId);
        Assert.Same(material, result.Material);
        Assert.Equal(430, result.Price);
    }

    [Fact]
    public async Task CalculatePrice_ShouldPassOuterDiameterWidthAndExtraMeasureToMaterialWeightCalculation()
    {
        var material = new RecordingMaterial(1)
        {
            Id = 4,
            Name = "Aluminum",
            PricePerKg = 30,
            PricePerHourMachine = 10,
            PricePerHourOperator = 15
        };

        _materialRepoMock.Setup(r => r.GetByNameAsync("Aluminum")).ReturnsAsync(material);
        _pulleyRepoMock.Setup(r => r.CreateAsync(It.IsAny<Pulley>())).ReturnsAsync((Pulley p) => p);

        await _service.CalculatePrice("Aluminum", 95, 18, 3.5, 2, 'A');

        Assert.Equal(95, material.LastDiameter);
        Assert.Equal(3.5, material.LastInches);
        Assert.Equal(5, material.LastMeasureToAddToDiameter);
    }

    [Fact]
    public async Task CalculatePrice_WithZeroGrooves_OnlyChargesMaterial()
    {
        var material = new FixedWeightMaterial(2)
        {
            Id = 6,
            Name = "Steel",
            PricePerKg = 80,
            PricePerHourMachine = 35,
            PricePerHourOperator = 25
        };

        _materialRepoMock.Setup(r => r.GetByNameAsync("Steel")).ReturnsAsync(material);
        _pulleyRepoMock.Setup(r => r.CreateAsync(It.IsAny<Pulley>())).ReturnsAsync((Pulley p) => p);

        var result = await _service.CalculatePrice("Steel", 120, 25, 2, 0, 'A');

        Assert.NotNull(result);
        Assert.Equal(0, result.GrooveCount);
        Assert.Equal(160, result.Price);
    }

    [Fact]
    public async Task CalculatePrice_ShouldPropagateRepositoryCreateException()
    {
        var material = new FixedWeightMaterial(1)
        {
            Id = 7,
            Name = "Steel",
            PricePerKg = 80,
            PricePerHourMachine = 35,
            PricePerHourOperator = 25
        };

        _materialRepoMock.Setup(r => r.GetByNameAsync("Steel")).ReturnsAsync(material);
        _pulleyRepoMock
            .Setup(r => r.CreateAsync(It.IsAny<Pulley>()))
            .ThrowsAsync(new InvalidOperationException("Persistence failed"));

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _service.CalculatePrice("Steel", 120, 25, 2, 1, 'A'));
    }
}
