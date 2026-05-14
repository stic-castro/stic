namespace Quotation.Domain.Models;

public class Gear : QuotableProduct
{
    public int TeethCount { get; set; }
    public double Module { get; set; }
    public double PitchDiameter { get; set; }
    public double OuterDiameter { get; set; }
    public double Width { get; set; }
    public double ToothHeight { get; set; }

    public GearTypes GearType { get; set; }
}
