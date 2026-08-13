using Quotation.Application.Abstract;
using Quotation.Data.Abstract;
using Quotation.Domain.Models;

namespace Quotation.Application.Concrete;

public class PulleyService : BaseService<Pulley, int>, IPulleyService
{
    private readonly IPulleyRepository _repository;
    private readonly IMaterialRepository _materialRepository;

    private const double HoursPerChannel = 1.5; 
    private const double MeasureToAddToDiameter =5;
    private const int QuantityOfPieces = 1;

    public PulleyService(IPulleyRepository repository, IMaterialRepository materialRepository) : base(repository)
    {
        _repository = repository;
        _materialRepository = materialRepository;
    }

    public async Task<Pulley?> CalculatePrice(string material, double outerDiameter, double innerBoreDiameter, double width, int grooveCount, char grooveType)
    {
        var materialToUse = await _materialRepository.GetByNameAsync(material);

        if (materialToUse == null) return null;

        var price = CalculatePulleyPrice(materialToUse, outerDiameter, width, grooveCount);
        var pulley = new Pulley()
        {
            OuterDiameter = outerDiameter,
            InnerBoreDiameter = innerBoreDiameter,
            Width = width,
            GrooveCount = grooveCount,
            GrooveType = grooveType,
            Material = materialToUse,
            MaterialId = materialToUse.Id,
            Price = price
        };
        
        return await _repository.CreateAsync(pulley);
    }

    private static double CalculatePulleyPrice(Material material, double outerDiameter, double width, int grooveCount)
    {
        var weight = material.CalculateWeight(outerDiameter, material, width, MeasureToAddToDiameter);
        var materialPrice = QuantityOfPieces * weight * material.PricePerKg;
        var hourlyRate = material.PricePerHourMachine + material.PricePerHourOperator;
        var machiningPrice = grooveCount * HoursPerChannel * hourlyRate;

        return materialPrice + machiningPrice;
    }
}
