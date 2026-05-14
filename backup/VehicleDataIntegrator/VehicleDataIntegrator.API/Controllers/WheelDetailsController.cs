using VehicleDataIntegrator.Application.Abstract;
using VehicleDataIntegrator.Domain.Models;

using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using VehicleDataIntegrator.API.Dtos;

namespace VehicleDataIntegrator.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WheelDetailsController : ControllerBase
{
    private readonly IWheelDetailsService _wheelDetailsService;
    private readonly HttpClient _httpClient;
    private readonly string _eventBusPublishUrl;

    public WheelDetailsController(IWheelDetailsService wheelDetailsService, IConfiguration configuration)
    {
        _wheelDetailsService = wheelDetailsService;
        _httpClient = new HttpClient();
        //_eventBusPublishUrl = Environment.GetEnvironmentVariable("EVENT_BUS_PUBLISH_URL")
        //                    ?? throw new InvalidOperationException("EVENT_BUS_PUBLISH_URL no está definido.");
        _eventBusPublishUrl = "http://eventbus:5233/api/events/publish";
    }

    [HttpGet]
    public async Task<ActionResult<List<WheelDetails>>> GetWheelFitments(
        [FromQuery] string make,
        [FromQuery] string model,
        [FromQuery] int year,
        [FromQuery] string? region)
    {
        if (string.IsNullOrWhiteSpace(make) || string.IsNullOrWhiteSpace(model) || year <= 0)
            return BadRequest("Invalid parameters. Make, model, and a valid year are required.");

        var result = await _wheelDetailsService.GetWheelFitmentsAsync(make, model, year, region);

        if (result == null || result.Count == 0)
            return NotFound("No wheel fitment data found for the specified vehicle.");

        return Ok(result);
    }

    [HttpGet("makes")]
    public async Task<ActionResult<IEnumerable<string>>> GetAllMakes()
    {
        var makes = await _wheelDetailsService.GetAllMakesAsync();
        return Ok(makes);
    }

    [HttpGet("models")]
    public async Task<ActionResult<IEnumerable<string>>> GetModels([FromQuery] string make)
    {
        if (string.IsNullOrWhiteSpace(make))
            return BadRequest("Parameter 'make' is required.");

        var models = await _wheelDetailsService.GetModelsByMakeAsync(make);
        return Ok(models);
    }

    [HttpGet("years")]
    public async Task<ActionResult<IEnumerable<int>>> GetYears([FromQuery] string make, [FromQuery] string model)
    {
        if (string.IsNullOrWhiteSpace(make) || string.IsNullOrWhiteSpace(model))
            return BadRequest("Parameters 'make' and 'model' are required.");

        var years = await _wheelDetailsService.GetYearsByMakeAndModelAsync(make, model);
        return Ok(years);
    }

    [HttpPost("request")]
    public async Task<IActionResult> HandleWheelDetailsRequest([FromBody] EventWrapper eventWrapper)
    {
        Console.WriteLine("Received WheelDetailsRequest event: " + eventWrapper.Data);
        var request = eventWrapper.Data;
        if (string.IsNullOrWhiteSpace(request.Make) || string.IsNullOrWhiteSpace(request.Model) || request.Year <= 0)
            return BadRequest("Parámetros inválidos. Se requieren Make, Model y un Year válido.");

        var fitments = await _wheelDetailsService.GetWheelFitmentsAsync(request.Make, request.Model, request.Year, request.Region);

        if (fitments.Count == 0)
            return NotFound("No se encontraron configuraciones de ruedas para el vehículo especificado.");

        var eventResponsePayload = new
        {
            EventType = "WheelDetailsResponse",
            Data = new
            {
                CorrelationId = request.CorrelationId,
                Make = fitments.First().Make,
                Model = fitments.First().Model,
                Year = fitments.First().Year,
                Region = fitments.First().Region,
                BoltCount = fitments.First().BoltCount,
                BoltPattern = fitments.First().BoltPattern,
                CenterBore = fitments.First().CenterBore,
            }
        };

        var response = await _httpClient.PostAsJsonAsync(_eventBusPublishUrl, eventResponsePayload);

        if (!response.IsSuccessStatusCode)
            return StatusCode((int)response.StatusCode, "Error publicando WheelDetailsResponse al Event Bus.");

        return Ok("Solicitud procesada y evento WheelDetailsResponse publicado.");
    }
}
