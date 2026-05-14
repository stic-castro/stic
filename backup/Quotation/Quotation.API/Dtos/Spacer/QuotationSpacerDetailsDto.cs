namespace Quotation.API.Dtos.Spacer;

public class QuotationSpacerDetailsDto
{
    public string Make {get; set;} = string.Empty;
    public string Model {get; set;} = string.Empty;
    public int Year {get; set;}
    public double Inches {get; set;}
    public string Material {get; set;} = string.Empty;
}
