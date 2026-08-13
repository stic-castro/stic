namespace Quotation.Domain.Models;

public class Pulley : QuotableProduct
{
    public double OuterDiameter { get; set; }
    public double InnerBoreDiameter { get; set; }
    public double Width { get; set; }
    public int GrooveCount { get; set; }
    public char GrooveType { get; set; }
}