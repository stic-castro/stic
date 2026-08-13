namespace Quotation.Domain.Models;

public class WheelDetails : Vehicle
{
    public string? Region { get; set; }
    public int BoltCount { get; set; }           
    public double BoltPattern { get; set; }      
    public double CenterBore { get; set; }       
    public string? LugType { get; set; }          
    public string? ThreadSize { get; set; } 
    public string CorrelationId { get; set; }
}