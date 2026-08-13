namespace Quotation.Tests.Application.Concrete;

using Moq;
using Quotation.Application.Concrete;
using Quotation.Data.Abstract;
using Quotation.Domain.Models;

public class MaterialServiceTests
{
    private readonly Mock<IMaterialRepository> _repositoryMock = new();
    private readonly MaterialService _service;

    public MaterialServiceTests()
    {
        _service = new MaterialService(_repositoryMock.Object);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsRepositoryMaterials()
    {
        var materials = new[]
        {
            CreateMaterial(1, "Steel"),
            CreateMaterial(2, "Aluminum")
        };

        _repositoryMock.Setup(r => r.GetAllAsync()).ReturnsAsync(materials);

        var result = await _service.GetAllAsync();

        Assert.Same(materials, result);
    }

    [Fact]
    public async Task UpdateAsync_PassesMaterialToRepository()
    {
        var material = CreateMaterial(4, "Bronze");
        _repositoryMock.Setup(r => r.UpdateAsync(4, material)).ReturnsAsync(material);

        var result = await _service.UpdateAsync(4, material);

        Assert.Same(material, result);
        _repositoryMock.Verify(r => r.UpdateAsync(4, material), Times.Once);
    }

    [Fact]
    public async Task GetAllAsync_WithPagination_ReturnsRepositoryMaterials()
    {
        var materials = new[]
        {
            CreateMaterial(1, "Steel")
        };

        _repositoryMock.Setup(r => r.GetAllAsync(3, 15)).ReturnsAsync(materials);

        var result = await _service.GetAllAsync(3, 15);

        Assert.Same(materials, result);
        _repositoryMock.Verify(r => r.GetAllAsync(3, 15), Times.Once);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_WhenRepositoryDoesNotFindMaterial()
    {
        _repositoryMock.Setup(r => r.GetByIdAsync(404)).ReturnsAsync((Material?)null);

        var result = await _service.GetByIdAsync(404);

        Assert.Null(result);
    }

    [Fact]
    public async Task CreateAsync_PassesMaterialToRepository()
    {
        var material = CreateMaterial(6, "Copper");
        _repositoryMock.Setup(r => r.CreateAsync(material)).ReturnsAsync(material);

        var result = await _service.CreateAsync(material);

        Assert.Same(material, result);
        _repositoryMock.Verify(r => r.CreateAsync(material), Times.Once);
    }

    [Fact]
    public async Task SoftDeleteAsync_ReturnsRepositoryResult()
    {
        _repositoryMock.Setup(r => r.SoftDeleteAsync(6)).ReturnsAsync(1);

        var result = await _service.SoftDeleteAsync(6);

        Assert.Equal(1, result);
        _repositoryMock.Verify(r => r.SoftDeleteAsync(6), Times.Once);
    }

    private static Material CreateMaterial(int id, string name) => new()
    {
        Id = id,
        Name = name,
        Density = 7800,
        PricePerKg = 10,
        PricePerHourMachine = 5,
        PricePerHourOperator = 4
    };
}
