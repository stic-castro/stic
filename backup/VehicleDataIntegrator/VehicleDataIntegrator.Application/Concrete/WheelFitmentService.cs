using VehicleDataIntegrator.Application.Abstract;
using VehicleDataIntegrator.Domain.Models;

namespace VehicleDataIntegrator.Application.Concrete;

public class WheelFitmentService : IWheelDetailsService
{
    private readonly IWheelDetailsIntegration _integration;

    public WheelFitmentService(IWheelDetailsIntegration integration)
    {
        _integration = integration;
    }

    public async Task<List<WheelDetails>> GetWheelFitmentsAsync(string make, string model, int year, string? region)
    {
        var rawData = await _integration.GetWheelFitmentAsync(make, model, year, region);

        var grouped = rawData
            .GroupBy(d => new
            {
                d.BoltCount,
                d.BoltPattern,
                d.CenterBore,
                d.LugType,
                d.ThreadSize
            })
            .ToList();

        var result = grouped.Select(g => new WheelDetails()
        {
            Make = make,
            Model = model,
            Year = year,
            BoltCount = g.Key.BoltCount,
            BoltPattern = g.Key.BoltPattern,
            CenterBore = g.Key.CenterBore,
            LugType = g.Key.LugType,
            ThreadSize = g.Key.ThreadSize
        }).ToList();

        return result;
    }

    public async Task<IEnumerable<string>> GetAllMakesAsync()
    {
        return await _integration.GetAllMakesAsync();
    }

    public async Task<IEnumerable<string>> GetModelsByMakeAsync(string make)
    {
        return await _integration.GetModelsByMakeAsync(make);
    }

    public async Task<IEnumerable<int>> GetYearsByMakeAndModelAsync(string make, string model)
    {
        return await _integration.GetYearsByMakeAndModelAsync(make, model);
    }
}
