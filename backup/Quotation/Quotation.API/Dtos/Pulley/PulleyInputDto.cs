namespace Quotation.API.Dtos.Pulley;

public class PulleyInputDto : IMapFrom<Domain.Models.Pulley>
{
    public double OuterDiameter { get; set; }
    public double InnerBoreDiameter { get; set; }
    public double Width { get; set; }
    public int GrooveCount { get; set; }
    public char GrooveType { get; set; }
}