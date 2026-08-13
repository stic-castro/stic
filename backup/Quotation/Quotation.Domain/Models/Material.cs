namespace Quotation.Domain.Models;

public class Material : BaseEntity<int>
{
    public double PricePerKg { get; set; }
    public string Name { get; set; }
    public double Density { get; set; }
    public double PricePerHourMachine { get; set; }
    public double PricePerHourOperator { get; set; }
    
    public virtual double CalculateWeight(double diameter, Material material, double inches, double measureToAddToDiameter)
    {
        var volume = CalculateVolume(diameter, inches, measureToAddToDiameter);
        return volume * material.Density;
    }
    
    private double CalculateVolume(double diameter, double inches, double measureToAddToDiameter)
    {
        double diameterMm = CalculateDiameter(diameter, measureToAddToDiameter); 
        double radiusMeters = (diameterMm / 1000.0) / 2.0;
        double heightMeters = inches * 0.0254;
        
        return Math.PI * Math.Pow(radiusMeters, 2) * heightMeters;
    }
    
    private double CalculateDiameter(double diameter, double measureToAddToDiameter)
    {
        return diameter + measureToAddToDiameter;
    }
}