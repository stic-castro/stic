using Quotation.Domain.Models;

namespace Quotation.Application.Abstract;

public interface IPulleyService : IBaseService<Pulley, int>
{
    Task<Pulley?> CalculatePrice(string material, double outerDiameter, double innerBoreDiameter, double width, int grooveCount, char grooveType);
}
