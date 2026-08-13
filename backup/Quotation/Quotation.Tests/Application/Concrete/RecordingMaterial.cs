namespace Quotation.Tests.Application.Concrete;

using Quotation.Domain.Models;

public class RecordingMaterial : Material
{
    private readonly double _weight;

    public RecordingMaterial(double weight)
    {
        _weight = weight;
    }

    public double LastDiameter { get; private set; }
    public double LastInches { get; private set; }
    public double LastMeasureToAddToDiameter { get; private set; }

    public override double CalculateWeight(double diameter, Material material, double inches, double measureToAddToDiameter)
    {
        LastDiameter = diameter;
        LastInches = inches;
        LastMeasureToAddToDiameter = measureToAddToDiameter;

        return _weight;
    }
}
