using Quotation.Application.Abstract;
using Quotation.Data.Abstract;
using Quotation.Domain.Models;

namespace Quotation.Application.Concrete;

public class GearService : BaseService<Gear, int>, IGearService
{
    private readonly IGearRepository _gearRepository;
    private readonly IMaterialRepository _materialRepository;

    private const double HoursPerTooth = 0.17; 
    private const int QuantityOfPieces = 1;

    public GearService(IGearRepository gearRepository, IMaterialRepository materialRepository) 
        : base(gearRepository)
    {
        _gearRepository = gearRepository;
        _materialRepository = materialRepository;
    }

    public async Task<Gear?> CalculatePrice(string material, int toothCount, double module, double pitchDiameter, double outerDiameter, double width, double toothHeight, string gearType)
    {
        var materialToUse = await _materialRepository.GetByNameAsync(material);

        if (materialToUse == null) return null;

        var price = CalculateGearPrice(materialToUse, toothCount, outerDiameter, width);

        var gear = new Gear()
        {
            TeethCount = toothCount,
            Module = module,
            PitchDiameter = pitchDiameter,
            OuterDiameter = outerDiameter,
            Width = width,
            ToothHeight = toothHeight,
            GearType = ParseGearTypeOrDefault(gearType),
            Material = materialToUse,
            MaterialId = materialToUse.Id,
            Price = price
        };

        return await _gearRepository.CreateAsync(gear);
    }

    private static double CalculateGearPrice(Material material, int toothCount, double outerDiameter, double width)
    {
        var weight = material.CalculateWeight(outerDiameter, material, width, 0);
        var materialPrice = QuantityOfPieces * weight * material.PricePerKg;
        var hourlyRate = material.PricePerHourMachine + material.PricePerHourOperator;
        var machiningPrice = toothCount * HoursPerTooth * hourlyRate;

        return materialPrice + machiningPrice;
    }

    private static GearTypes ParseGearTypeOrDefault(string gearType)
    {
        return Enum.TryParse(gearType, ignoreCase: true, out GearTypes gearTypeEnum)
            ? gearTypeEnum
            : GearTypes.Spur;
    }
}
