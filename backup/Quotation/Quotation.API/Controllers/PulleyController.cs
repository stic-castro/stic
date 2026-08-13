namespace Quotation.API.Controllers;

using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Quotation.API.Dtos.Pulley;
using Quotation.Application.Abstract;
using Quotation.Domain.Models;
using EventWrapper = Quotation.Domain.Models.EventWrapper;


[ApiController]
[Route("api/quotation/[controller]")]
public class PulleyController : BaseController<Pulley, PulleyOutputDto, PulleyInputDto, int>
{
    private readonly IPulleyService _pulleyService;

    public PulleyController(IMapper mapper, IPulleyService service, IPulleyService pulleyService) : base(mapper, service)
    {
        _pulleyService = pulleyService;
    }

    [HttpPost("calculate-price")]
    public async Task<ActionResult<PulleyOutputDto>> GetQuotation([FromBody] QuotationPulleyDetailsDto quotationDetails)
    {
        var totalPrice = await _pulleyService.CalculatePrice(quotationDetails.Material,
            quotationDetails.OuterDiameter, quotationDetails.InnerBoreDiameter,
            quotationDetails.Width, quotationDetails.GrooveCount, quotationDetails.GrooveType);
        
        var response = _mapper.Map<PulleyOutputDto>(totalPrice);
        return Ok(response);
    }
    
}
