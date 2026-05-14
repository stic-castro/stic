using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Quotation.API.Dtos.Spacer;
using Quotation.Application.Abstract;
using Quotation.Domain.Models;
using EventWrapper = Quotation.Domain.Models.EventWrapper;

namespace Quotation.API.Controllers;

[ApiController]
[Route("api/quotation/[controller]")]
public class SpacerController : BaseController<Spacer, SpacerOutputDto, SpacerInputDto, int>
{
    private readonly ISpacerService _spacerService;

    public SpacerController(IMapper mapper, ISpacerService service, ISpacerService spacerService) : base(mapper, service)
    {
        _spacerService = spacerService;
    }

    [HttpPost("calculate-price")]
    public async Task<ActionResult<SpacerOutputDto>> GetQuotation([FromBody] QuotationSpacerDetailsDto quotationSpacerDetails)
    {
        var totalPrice = await _spacerService.CalculatePrice(quotationSpacerDetails.Material,
            quotationSpacerDetails.Inches, quotationSpacerDetails.Make, quotationSpacerDetails.Model,
            quotationSpacerDetails.Year);
        var response = _mapper.Map<SpacerOutputDto>(totalPrice);
    return Ok(response);
    }
    
    [HttpPost("receiver")]
    public IActionResult Receive([FromBody] EventWrapper eventWrapper)
    {
        SpacerRepository.ReceiveEventWebhook(eventWrapper);
        return Ok();
    }
}