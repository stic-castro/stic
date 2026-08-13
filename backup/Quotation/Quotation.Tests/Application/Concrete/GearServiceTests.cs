namespace Quotation.Tests.Application.Concrete;

using Moq;
using Quotation.Application.Concrete;
using Quotation.Data.Abstract;
using Quotation.Domain.Models;

public class GearServiceTests
{
    private readonly Mock<IGearRepository> _gearRepoMock = new();
    private readonly Mock<IMaterialRepository> _materialRepoMock = new();
    private readonly GearService _service;

    public GearServiceTests()
    {
        _service = new GearService(_gearRepoMock.Object, _materialRepoMock.Object);
    }

    [Fact]
    public async Task CalculatePrice_ReturnsNull_WhenMaterialDoesNotExist()
    {
        _materialRepoMock.Setup(r => r.GetByNameAsync("Unknown")).ReturnsAsync((Material?)null);

        var result = await _service.CalculatePrice("Unknown", 20, 2, 40, 44, 1.5, 4, "Helical");

        Assert.Null(result);
        _gearRepoMock.Verify(r => r.CreateAsync(It.IsAny<Gear>()), Times.Never);
    }

    [Fact]
    public async Task CalculatePrice_CreatesGear_WithParsedGearTypeAndExpectedPrice()
    {
        var material = new FixedWeightMaterial(2.5)
        {
            Id = 5,
            Name = "Steel",
            PricePerKg = 40,
            PricePerHourMachine = 30,
            PricePerHourOperator = 20
        };

        _materialRepoMock.Setup(r => r.GetByNameAsync("Steel")).ReturnsAsync(material);
        _gearRepoMock.Setup(r => r.CreateAsync(It.IsAny<Gear>())).ReturnsAsync((Gear g) => g);

        var result = await _service.CalculatePrice("Steel", 20, 2, 40, 44, 1.5, 4, "Helical");

        Assert.NotNull(result);
        Assert.Equal(20, result.TeethCount);
        Assert.Equal(2, result.Module);
        Assert.Equal(40, result.PitchDiameter);
        Assert.Equal(44, result.OuterDiameter);
        Assert.Equal(1.5, result.Width);
        Assert.Equal(4, result.ToothHeight);
        Assert.Equal(GearTypes.Helical, result.GearType);
        Assert.Equal(5, result.MaterialId);
        Assert.Equal(270, result.Price);
    }

    [Fact]
    public async Task CalculatePrice_DefaultsToSpur_WhenGearTypeCannotBeParsed()
    {
        var material = new FixedWeightMaterial(1)
        {
            Id = 2,
            Name = "Nylon",
            PricePerKg = 10,
            PricePerHourMachine = 5,
            PricePerHourOperator = 5
        };

        _materialRepoMock.Setup(r => r.GetByNameAsync("Nylon")).ReturnsAsync(material);
        _gearRepoMock.Setup(r => r.CreateAsync(It.IsAny<Gear>())).ReturnsAsync((Gear g) => g);

        var result = await _service.CalculatePrice("Nylon", 8, 1, 8, 10, 1, 1, "Invalid");

        Assert.NotNull(result);
        Assert.Equal(GearTypes.Spur, result.GearType);
    }

    [Fact]
    public async Task CalculatePrice_ParsesGearTypeIgnoringCasing()
    {
        var material = new FixedWeightMaterial(1)
        {
            Id = 3,
            Name = "Steel",
            PricePerKg = 10,
            PricePerHourMachine = 5,
            PricePerHourOperator = 5
        };

        _materialRepoMock.Setup(r => r.GetByNameAsync("Steel")).ReturnsAsync(material);
        _gearRepoMock.Setup(r => r.CreateAsync(It.IsAny<Gear>())).ReturnsAsync((Gear g) => g);

        var result = await _service.CalculatePrice("Steel", 8, 1, 8, 10, 1, 1, "helical");

        Assert.NotNull(result);
        Assert.Equal(GearTypes.Helical, result.GearType);
    }

    [Fact]
    public async Task CalculatePrice_ShouldPassOuterDiameterWidthAndNoExtraMeasureToMaterialWeightCalculation()
    {
        var material = new RecordingMaterial(1)
        {
            Id = 4,
            Name = "Bronze",
            PricePerKg = 30,
            PricePerHourMachine = 10,
            PricePerHourOperator = 15
        };

        _materialRepoMock.Setup(r => r.GetByNameAsync("Bronze")).ReturnsAsync(material);
        _gearRepoMock.Setup(r => r.CreateAsync(It.IsAny<Gear>())).ReturnsAsync((Gear g) => g);

        await _service.CalculatePrice("Bronze", 12, 1, 12, 14, 2.5, 1, "Bevel");

        Assert.Equal(14, material.LastDiameter);
        Assert.Equal(2.5, material.LastInches);
        Assert.Equal(0, material.LastMeasureToAddToDiameter);
    }

    [Fact]
    public async Task CalculatePrice_WithZeroTeeth_ShouldOnlyChargeMaterial()
    {
        var material = new FixedWeightMaterial(1.25)
        {
            Id = 9,
            Name = "Nylon",
            PricePerKg = 16,
            PricePerHourMachine = 100,
            PricePerHourOperator = 50
        };

        _materialRepoMock.Setup(r => r.GetByNameAsync("Nylon")).ReturnsAsync(material);
        _gearRepoMock.Setup(r => r.CreateAsync(It.IsAny<Gear>())).ReturnsAsync((Gear g) => g);

        var result = await _service.CalculatePrice("Nylon", 0, 1, 0, 10, 1, 1, "Spur");

        Assert.NotNull(result);
        Assert.Equal(0, result.TeethCount);
        Assert.Equal(20, result.Price);
    }
}
