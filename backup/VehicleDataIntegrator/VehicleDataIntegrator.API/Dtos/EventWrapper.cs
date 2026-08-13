namespace VehicleDataIntegrator.API.Dtos;

public class EventWrapper
{
    public string EventType { get; set; }
    public WheelDetailsRequest Data { get; set; }
}