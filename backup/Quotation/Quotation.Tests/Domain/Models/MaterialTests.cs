namespace Quotation.Tests.Domain.Models;

using Quotation.Domain.Models;

public class MaterialTests
{
    [Fact]
    public void CalculateWeight_UsesCylinderVolumeAndDensity()
    {
        var material = new Material
        {
            Id = 1,
            Name = "Steel",
            Density = 7850,
            PricePerKg = 20,
            PricePerHourMachine = 10,
            PricePerHourOperator = 8
        };

        var weight = material.CalculateWeight(100, material, 2, 10);

        var radiusMeters = 0.11 / 2;
        var heightMeters = 2 * 0.0254;
        var expectedVolume = Math.PI * Math.Pow(radiusMeters, 2) * heightMeters;
        var expectedWeight = expectedVolume * material.Density;

        Assert.Equal(expectedWeight, weight, precision: 6);
    }

    [Fact]
    public void CalculateWeight_ReturnsZero_WhenDensityIsZero()
    {
        var material = new Material
        {
            Id = 1,
            Name = "Foam",
            Density = 0,
            PricePerKg = 20,
            PricePerHourMachine = 10,
            PricePerHourOperator = 8
        };

        var weight = material.CalculateWeight(100, material, 2, 10);

        Assert.Equal(0, weight);
    }

    [Fact]
    public void CalculateWeight_IncreasesWeight_WhenExtraDiameterIsAdded()
    {
        var material = new Material
        {
            Id = 1,
            Name = "Steel",
            Density = 7850,
            PricePerKg = 20,
            PricePerHourMachine = 10,
            PricePerHourOperator = 8
        };

        var baseWeight = material.CalculateWeight(100, material, 2, 0);
        var weightWithExtraDiameter = material.CalculateWeight(100, material, 2, 60);

        Assert.True(weightWithExtraDiameter > baseWeight);
    }
}
