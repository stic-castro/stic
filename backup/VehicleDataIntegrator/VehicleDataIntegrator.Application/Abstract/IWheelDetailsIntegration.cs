using VehicleDataIntegrator.Domain.Models;

namespace VehicleDataIntegrator.Application.Abstract;

public interface IWheelDetailsIntegration
{
    Task<IEnumerable<WheelDetails>> GetWheelFitmentAsync(string make, string model, int year, string? region);
    Task<IEnumerable<string>> GetAllMakesAsync();
    Task<IEnumerable<string>> GetModelsByMakeAsync(string make);
    Task<IEnumerable<int>> GetYearsByMakeAndModelAsync(string make, string model);
}
