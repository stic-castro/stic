namespace VehicleDataIntegrator.API.Dtos;

public class WheelDetailsRequest
{
    public string Make { get; set; }
    public string Model { get; set; }
    public int Year { get; set; }
    public string CorrelationId { get; set; }
    public string? Region {get; set;}
}