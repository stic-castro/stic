using Quotation.Domain.Models;

namespace Quotation.Application.Abstract;

public interface IGearService : IBaseService<Gear, int>
{
    Task<Gear?> CalculatePrice(string material, int toothCount, double module, double pitchDiameter, double outerDiameter, double width, double toothHeight, string gearType);
}
