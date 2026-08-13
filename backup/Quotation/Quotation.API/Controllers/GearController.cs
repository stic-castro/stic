using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Quotation.API.Dtos.Gear;
using Quotation.Application.Abstract;
using Quotation.Domain.Models;

namespace Quotation.API.Controllers;

[ApiController]
[Route("api/quotation/[controller]")]
public class GearController : BaseController<Gear, GearOutputDto, GearInputDto, int>
{
    private readonly IGearService _gearService;

    public GearController(IMapper mapper, IGearService service, IGearService gearService) 
        : base(mapper, service)
    {
        _gearService = gearService;
    }

    [HttpPost("calculate-price")]
    public async Task<ActionResult<GearOutputDto>> GetQuotation([FromBody] GearInputDto gearInput)
    {
        var totalPrice = await _gearService.CalculatePrice(
            gearInput.Material,
            gearInput.ToothCount,
            gearInput.Module,
            gearInput.PitchDiameter,
            gearInput.OuterDiameter,
            gearInput.Width,
            gearInput.ToothHeight,
            gearInput.GearType);

        var response = _mapper.Map<GearOutputDto>(totalPrice);
        return Ok(response);
    }
}
