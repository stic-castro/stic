namespace Quotation.API.Dtos.Gear;

public class GearInputDto : IMapFrom<Domain.Models.Gear>
{
    public int ToothCount { get; set; }
    public double Module { get; set; }
    public double PitchDiameter { get; set; }
    public double OuterDiameter { get; set; }
    public double Width { get; set; }
    public double ToothHeight { get; set; }
    public string GearType { get; set; }
    public string Material { get; set; }
}
