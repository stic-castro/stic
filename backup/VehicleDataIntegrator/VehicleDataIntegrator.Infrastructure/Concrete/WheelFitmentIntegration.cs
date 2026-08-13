using System.Text.Json;
using Microsoft.Extensions.Options;
using VehicleDataIntegrator.Application.Abstract;
using VehicleDataIntegrator.Domain.Models;

namespace VehicleDataIntegrator.Infrastructure.Concrete;

public class WheelFitmentIntegration : IWheelDetailsIntegration
{
    private readonly HttpClient _httpClient;
    private readonly WheelFitmentSettings _settings;

    public WheelFitmentIntegration(HttpClient httpClient, IOptions<WheelFitmentSettings> settings)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
    }

    public async Task<IEnumerable<WheelDetails>> GetWheelFitmentAsync(string make, string model, int year, string? region = null)
    {
        if (!string.IsNullOrEmpty(region))
        {
            var url = BuildRequestUrl(make, model, year, region);
            var json = await GetJsonResponseAsync(url);
            return ParseWheelFitments(json);
        }

        // Prueba con múltiples regiones si no se especifica
        var regionsToTry = new[]
        {
            "usdm","cdm","mxndm","ladm","eudm","russia",
            "jdm","chdm","skdm","sam","medm","nadm","sadm","audm"};

        foreach (var regionAttempt in regionsToTry)
        {
            try
            {
                var url = BuildRequestUrl(make, model, year, regionAttempt);
                var json = await GetJsonResponseAsync(url);
                var results = ParseWheelFitments(json);
                if (results.Any())
                {
                    return results;
                }
            }
            catch (HttpRequestException ex) when (ex.Message.Contains("404"))
            {
                // Si no se encuentra, prueba la siguiente región
                continue;
            }
        }

        // Si ninguna región devuelve resultados válidos
        return Enumerable.Empty<WheelDetails>();
    }

    private string BuildRequestUrl(string make, string model, int year, string region)
    {
        return $"{_settings.BaseUrl}/search/by_model/?user_key={_settings.ApiKey}&region={region}&make={make}&model={model}&year={year}";
    }


    private async Task<string> GetJsonResponseAsync(string url)
    {
        var response = await _httpClient.GetAsync(url);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadAsStringAsync();
    }

    private IEnumerable<WheelDetails> ParseWheelFitments(string json)
    {
        using var doc = JsonDocument.Parse(json);
        var data = doc.RootElement.GetProperty("data");

        var results = new List<WheelDetails>();

        foreach (var item in data.EnumerateArray())
        {
            var make = item.GetProperty("make").GetProperty("name").GetString();
            var model = item.GetProperty("model").GetProperty("name").GetString();
            var year = item.GetProperty("start_year").GetInt32();

            var tech = item.GetProperty("technical");

            var boltCount = tech.TryGetProperty("stud_holes", out var studVal) && studVal.ValueKind != JsonValueKind.Null
                ? studVal.GetInt32()
                : 0;

            var boltPattern = tech.TryGetProperty("pcd", out var pcdVal) && pcdVal.ValueKind != JsonValueKind.Null
                ? pcdVal.GetDouble()
                : 0;

            var centerBore = tech.TryGetProperty("centre_bore", out var boreVal) && boreVal.ValueKind != JsonValueKind.Null
                ? double.Parse(boreVal.GetString())
                : 0;

            var fasteners = tech.GetProperty("wheel_fasteners");

            var lugType = fasteners.TryGetProperty("type", out var lugVal) && lugVal.ValueKind != JsonValueKind.Null
                ? lugVal.GetString()
                : null;

            var threadSize = fasteners.TryGetProperty("thread_size", out var threadVal) && threadVal.ValueKind != JsonValueKind.Null
                ? threadVal.GetString()
                : null;

            var region = item.TryGetProperty("regions", out var regions) && regions.GetArrayLength() > 0
                ? regions[0].GetString()
                : "Global";

            results.Add(new WheelDetails
            {
                Make = make,
                Model = model,
                Year = year,
                Region = region,
                BoltCount = boltCount,
                BoltPattern = boltPattern,
                CenterBore = centerBore,
                LugType = lugType,
                ThreadSize = threadSize
            });
        }

        return results;
    }
    
    public async Task<IEnumerable<string>> GetAllMakesAsync()
    {
        var url = $"{_settings.BaseUrl}/makes/?user_key={_settings.ApiKey}";
        var json = await GetJsonResponseAsync(url);

        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        var makes = new List<string>();

        if (root.TryGetProperty("data", out var makesArray) && makesArray.ValueKind == JsonValueKind.Array)
        {
            foreach (var item in makesArray.EnumerateArray())
            {
                if (item.TryGetProperty("name", out var nameProp))
                {
                    makes.Add(nameProp.GetString());
                }
            }
        }

        return makes;
    }

    
    public async Task<IEnumerable<string>> GetModelsByMakeAsync(string make)
    {
        var url = $"{_settings.BaseUrl}/models/?make={make}&user_key={_settings.ApiKey}";
        var json = await GetJsonResponseAsync(url);

        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        var models = new List<string>();

        if (root.TryGetProperty("data", out var modelsArray) && modelsArray.ValueKind == JsonValueKind.Array)
        {
            foreach (var item in modelsArray.EnumerateArray())
            {
                if (item.TryGetProperty("name", out var nameProp))
                {
                    models.Add(nameProp.GetString());
                }
            }
        }

        return models;
    }


    public async Task<IEnumerable<int>> GetYearsByMakeAndModelAsync(string make, string model)
    {
        var url = $"{_settings.BaseUrl}/years/?make={make}&model={model}&user_key={_settings.ApiKey}";
        var json = await GetJsonResponseAsync(url);

        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        var years = new List<int>();

        if (root.TryGetProperty("data", out var dataArray) && dataArray.ValueKind == JsonValueKind.Array)
        {
            foreach (var item in dataArray.EnumerateArray())
            {
                if (item.TryGetProperty("name", out var yearProp) && yearProp.TryGetInt32(out var year))
                {
                    years.Add(year);
                }
            }
        }

        return years.OrderByDescending(y => y);
    }

}
