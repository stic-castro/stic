namespace Quotation.API.Dtos.Spacer;

public class SpacerInputDto : IMapFrom<Domain.Models.Spacer>
{
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public int BoltCount { get; set; }
    public double BoltPattern { get; set; }
    public double ThicknessMm { get; set; }
    public double CenterBore { get; set; }
    public bool IsHubCentric { get; set; }
    public double Price { get; set; }
}
