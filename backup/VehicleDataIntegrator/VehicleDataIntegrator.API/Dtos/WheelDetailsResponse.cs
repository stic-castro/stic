using VehicleDataIntegrator.Domain.Models;

namespace VehicleDataIntegrator.API.Dtos;

public class WheelDetailsResponse
{
    public string CorrelationId { get; set; }
    public List<WheelDetails> Data { get; set; }
}