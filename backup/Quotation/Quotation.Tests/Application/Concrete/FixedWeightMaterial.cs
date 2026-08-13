namespace Quotation.Tests.Application.Concrete;

using Quotation.Domain.Models;

public class FixedWeightMaterial : Material
{
    private readonly double _weight;

    public FixedWeightMaterial(double weight)
    {
        _weight = weight;
    }

    public override double CalculateWeight(double diameter, Material material, double inches, double measureToAddToDiameter)
    {
        return _weight;
    }
}
