namespace VehicleDataIntegrator.Tests.Application.Concrete;

using Moq;
using VehicleDataIntegrator.Application.Abstract;
using VehicleDataIntegrator.Application.Concrete;
using VehicleDataIntegrator.Domain.Models;

public class WheelFitmentServiceTests
{
    private readonly Mock<IWheelDetailsIntegration> _integrationMock = new();
    private readonly WheelFitmentService _service;

    public WheelFitmentServiceTests()
    {
        _service = new WheelFitmentService(_integrationMock.Object);
    }

    [Fact]
    public async Task GetWheelFitmentsAsync_GroupsDuplicateTechnicalFitments()
    {
        var rawFitments = new[]
        {
            CreateWheelDetails("usdm", 6, 139.7, 106.1, "Nut", "M12x1.5"),
            CreateWheelDetails("mxndm", 6, 139.7, 106.1, "Nut", "M12x1.5"),
            CreateWheelDetails("eudm", 5, 114.3, 67.1, "Bolt", "M14x1.5")
        };

        _integrationMock
            .Setup(i => i.GetWheelFitmentAsync("Toyota", "Tacoma", 2018, "usdm"))
            .ReturnsAsync(rawFitments);

        var result = await _service.GetWheelFitmentsAsync("Toyota", "Tacoma", 2018, "usdm");

        Assert.Equal(2, result.Count);
        Assert.Contains(result, d => d.BoltCount == 6 && d.BoltPattern == 139.7 && d.CenterBore == 106.1);
        Assert.Contains(result, d => d.BoltCount == 5 && d.BoltPattern == 114.3 && d.CenterBore == 67.1);
        Assert.All(result, d =>
        {
            Assert.Equal("Toyota", d.Make);
            Assert.Equal("Tacoma", d.Model);
            Assert.Equal(2018, d.Year);
        });
    }

    [Fact]
    public async Task GetWheelFitmentsAsync_ReturnsEmptyList_WhenIntegrationReturnsNoData()
    {
        _integrationMock
            .Setup(i => i.GetWheelFitmentAsync("Ford", "Ranger", 2020, null))
            .ReturnsAsync(Array.Empty<WheelDetails>());

        var result = await _service.GetWheelFitmentsAsync("Ford", "Ranger", 2020, null);

        Assert.Empty(result);
    }

    [Fact]
    public async Task GetAllMakesAsync_ReturnsIntegrationMakes()
    {
        var makes = new[] { "Toyota", "Ford" };
        _integrationMock.Setup(i => i.GetAllMakesAsync()).ReturnsAsync(makes);

        var result = await _service.GetAllMakesAsync();

        Assert.Same(makes, result);
    }

    [Fact]
    public async Task GetModelsByMakeAsync_ReturnsIntegrationModels()
    {
        var models = new[] { "Tacoma", "Hilux" };
        _integrationMock.Setup(i => i.GetModelsByMakeAsync("Toyota")).ReturnsAsync(models);

        var result = await _service.GetModelsByMakeAsync("Toyota");

        Assert.Same(models, result);
    }

    [Fact]
    public async Task GetYearsByMakeAndModelAsync_ReturnsIntegrationYears()
    {
        var years = new[] { 2024, 2023, 2022 };
        _integrationMock.Setup(i => i.GetYearsByMakeAndModelAsync("Toyota", "Tacoma")).ReturnsAsync(years);

        var result = await _service.GetYearsByMakeAndModelAsync("Toyota", "Tacoma");

        Assert.Same(years, result);
    }

    private static WheelDetails CreateWheelDetails(string region, int boltCount, double boltPattern, double centerBore, string lugType, string threadSize)
    {
        return new WheelDetails
        {
            Make = "Original",
            Model = "Original",
            Year = 2000,
            Region = region,
            BoltCount = boltCount,
            BoltPattern = boltPattern,
            CenterBore = centerBore,
            LugType = lugType,
            ThreadSize = threadSize
        };
    }
}
