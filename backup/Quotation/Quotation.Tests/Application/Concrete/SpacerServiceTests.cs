namespace Quotation.Tests.Application.Concrete;

using Moq;
using Quotation.Application.Concrete;
using Quotation.Data.Abstract;
using Quotation.Domain.Models;


public class SpacerServiceTests
{
    private readonly Mock<ISpacerRepository> _spacerRepoMock;
    private readonly Mock<IMaterialRepository> _materialRepoMock;
    private readonly SpacerService _service;

    public SpacerServiceTests()
    {
        _spacerRepoMock = new Mock<ISpacerRepository>();
        _materialRepoMock = new Mock<IMaterialRepository>();

        _service = new SpacerService(_spacerRepoMock.Object, _materialRepoMock.Object);
    }
    
    [Fact]
    public async Task CalculatePrice_ShouldReturnNull_WhenMaterialNotFound()
    {
        _materialRepoMock.Setup(r => r.GetByNameAsync(It.IsAny<string>()))
            .ReturnsAsync((Material?)null);

        var result = await _service.CalculatePrice("Unknown", 1.5, 
            "Ford", "Ranger", 2015);

        Assert.Null(result);
        _spacerRepoMock.Verify(r => r.CreateAsync(It.IsAny<Spacer>()), Times.Never);
    }

    [Fact]
    public async Task CalculatePrice_ShouldReturnSpacer_WithCorrectPrice()
    {
        string materialName = "Aluminum";
        double inches = 2.0;
        string make = "Toyota";
        string model = "Tacoma";
        int year = 2010;

        var fakeMaterial = new FakeMaterial
        {
            Id = 1,
            Name = materialName,
            PricePerKg = 100,
            PricePerHourMachine = 30,
            PricePerHourOperator = 20
        };

        var wheelDetails = new WheelDetails
        {
            BoltCount = 6,
            BoltPattern = 139.7,
            CenterBore = 106.1
        };

        _materialRepoMock.Setup(r => r.GetByNameAsync(materialName)).ReturnsAsync(fakeMaterial);
        _spacerRepoMock.Setup(r => r.GetWheelDetails(make, model, year)).ReturnsAsync(wheelDetails);
        _spacerRepoMock.Setup(r => r.CreateAsync(It.IsAny<Spacer>())).ReturnsAsync((Spacer s) => s);

        var result = await _service.CalculatePrice(materialName, inches, make, model, year);

        Assert.NotNull(result);
        Assert.Equal(6, result.BoltCount);
        Assert.Equal(make, result.Make);
        Assert.Equal(model, result.Model);
        Assert.Equal(year, result.Year);
        Assert.Equal(139.7, result.BoltPattern);
        Assert.Equal(106.1, result.CenterBore);
        Assert.Equal(fakeMaterial, result.Material);
        Assert.Equal(1, result.MaterialId);
        Assert.Equal(inches, result.ThicknessMm);
        Assert.Equal(1100, result.Price);
        Assert.False(result.IsHubCentric);
    }

    [Fact]
    public async Task CalculatePrice_ShouldUseVehicleWheelDetails_WhenCreatingSpacer()
    {
        var material = new FakeMaterial
        {
            Id = 8,
            Name = "Steel",
            PricePerKg = 50,
            PricePerHourMachine = 10,
            PricePerHourOperator = 15
        };

        var wheelDetails = new WheelDetails
        {
            BoltCount = 5,
            BoltPattern = 114.3,
            CenterBore = 67.1
        };

        Spacer? createdSpacer = null;

        _materialRepoMock.Setup(r => r.GetByNameAsync("Steel")).ReturnsAsync(material);
        _spacerRepoMock.Setup(r => r.GetWheelDetails("Nissan", "Frontier", 2019)).ReturnsAsync(wheelDetails);
        _spacerRepoMock
            .Setup(r => r.CreateAsync(It.IsAny<Spacer>()))
            .Callback<Spacer>(s => createdSpacer = s)
            .ReturnsAsync((Spacer s) => s);

        await _service.CalculatePrice("Steel", 1, "Nissan", "Frontier", 2019);

        Assert.NotNull(createdSpacer);
        Assert.Equal(5, createdSpacer.BoltCount);
        Assert.Equal("Nissan", createdSpacer.Make);
        Assert.Equal("Frontier", createdSpacer.Model);
        Assert.Equal(2019, createdSpacer.Year);
        Assert.Equal(114.3, createdSpacer.BoltPattern);
        Assert.Equal(67.1, createdSpacer.CenterBore);
        Assert.Equal(8, createdSpacer.MaterialId);
    }

    [Fact]
    public async Task CalculatePrice_ShouldPassBoltPatternAndThicknessToMaterialWeightCalculation()
    {
        var material = new RecordingMaterial(2)
        {
            Id = 10,
            Name = "Aluminum",
            PricePerKg = 25,
            PricePerHourMachine = 12,
            PricePerHourOperator = 8
        };

        _materialRepoMock.Setup(r => r.GetByNameAsync("Aluminum")).ReturnsAsync(material);
        _spacerRepoMock
            .Setup(r => r.GetWheelDetails("Toyota", "Hilux", 2021))
            .ReturnsAsync(new WheelDetails
            {
                BoltCount = 6,
                BoltPattern = 139.7,
                CenterBore = 106.1
            });
        _spacerRepoMock.Setup(r => r.CreateAsync(It.IsAny<Spacer>())).ReturnsAsync((Spacer s) => s);

        await _service.CalculatePrice("Aluminum", 1.5, "Toyota", "Hilux", 2021);

        Assert.Equal(139.7, material.LastDiameter);
        Assert.Equal(1.5, material.LastInches);
        Assert.Equal(60, material.LastMeasureToAddToDiameter);
    }

    [Fact]
    public async Task CalculatePrice_ShouldThrow_WhenWheelDetailsAreMissing()
    {
        _materialRepoMock.Setup(r => r.GetByNameAsync("Steel")).ReturnsAsync(new FakeMaterial
        {
            Id = 1,
            Name = "Steel",
            PricePerKg = 100,
            PricePerHourMachine = 30,
            PricePerHourOperator = 20
        });
        _spacerRepoMock
            .Setup(r => r.GetWheelDetails("Unknown", "Model", 1999))
            .ReturnsAsync((WheelDetails?)null!);

        await Assert.ThrowsAsync<NullReferenceException>(() =>
            _service.CalculatePrice("Steel", 1, "Unknown", "Model", 1999));

        _spacerRepoMock.Verify(r => r.CreateAsync(It.IsAny<Spacer>()), Times.Never);
    }

    [Fact]
    public async Task CalculatePrice_WithZeroThickness_ShouldOnlyChargeMaterialWhenWeightIsPositive()
    {
        var material = new FakeMaterial
        {
            Id = 2,
            Name = "Aluminum",
            PricePerKg = 100,
            PricePerHourMachine = 30,
            PricePerHourOperator = 20
        };

        _materialRepoMock.Setup(r => r.GetByNameAsync("Aluminum")).ReturnsAsync(material);
        _spacerRepoMock.Setup(r => r.GetWheelDetails("Toyota", "Tacoma", 2010)).ReturnsAsync(new WheelDetails
        {
            BoltCount = 6,
            BoltPattern = 139.7,
            CenterBore = 106.1
        });
        _spacerRepoMock.Setup(r => r.CreateAsync(It.IsAny<Spacer>())).ReturnsAsync((Spacer s) => s);

        var result = await _service.CalculatePrice("Aluminum", 0, "Toyota", "Tacoma", 2010);

        Assert.NotNull(result);
        Assert.Equal(600, result.Price);
        Assert.Equal(0, result.ThicknessMm);
    }
}
