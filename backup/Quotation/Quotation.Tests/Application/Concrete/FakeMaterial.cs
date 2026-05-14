using Quotation.Domain.Models;

namespace Quotation.Tests.Application.Concrete;

public class FakeMaterial : Material
{
    public override double CalculateWeight(double boltPattern, Material material, double inches, double extra)
    {
        return 1.5; // valor simulado
    }
}