using Quotation.Application.Abstract;
using Quotation.Data.Abstract;
using Quotation.Domain.Models;

namespace Quotation.Application.Concrete;

public class SpacerService : BaseService<Spacer, int>, ISpacerService
{
    private readonly ISpacerRepository _repository;
    private readonly IMaterialRepository _materialRepository;

    private const int HoursPerInch = 5;
    private const double MeasureToAddToDiameter = 60;
    private const int QuantityOfPieces = 4;

    public SpacerService(ISpacerRepository repository, IMaterialRepository materialRepository) : base(repository)
    {
        _repository = repository;
        _materialRepository = materialRepository;
    }

    public async Task<Spacer?> CalculatePrice(string material, double inches, string make, string model, int year)
    { 
        var wheelDetails = await _repository.GetWheelDetails(make, model, year);
        var materialToUse = await _materialRepository.GetByNameAsync(material);
        
        if (materialToUse != null)
        {
            var weight = materialToUse.CalculateWeight(wheelDetails.BoltPattern, materialToUse, inches, MeasureToAddToDiameter);
            var totalJobPrice = (materialToUse.PricePerHourMachine + materialToUse.PricePerHourOperator) * inches * HoursPerInch ;
            var materialPrice = QuantityOfPieces * weight * materialToUse.PricePerKg;
            var spacer = new Spacer()
            {
                Make = make,
                Model = model,
                Year = year,
                BoltCount = wheelDetails.BoltCount,
                BoltPattern = wheelDetails.BoltPattern,
                CenterBore = wheelDetails.CenterBore,
                IsHubCentric = false,
                Material = materialToUse,
                MaterialId = materialToUse.Id,
                Price = materialPrice + totalJobPrice,
                ThicknessMm = inches
            };
            return await _repository.CreateAsync(spacer);
        }
        return null;
    }
    
}
