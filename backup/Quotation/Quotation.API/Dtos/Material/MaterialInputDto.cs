using Quotation.Domain.Models;

namespace Quotation.API.Dtos.Material;

public class MaterialInputDto : IMapFrom<Domain.Models.Material>
{
    public double PricePerKg { get; set; }
    public string Name { get; set; }
    public double Density { get; set; }
    public double PricePerHourMachine { get; set; }
    public double PricePerHourOperator { get; set; }
}