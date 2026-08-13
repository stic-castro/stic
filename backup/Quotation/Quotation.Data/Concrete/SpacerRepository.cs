using System;
using System.Collections.Concurrent;
using System.Net.Http;
using System.Net.Http.Json;
using Quotation.Data.Abstract;
using Quotation.Data.Concrete;
using Quotation.Data.Contexts;
using Quotation.Domain.Models;

public class SpacerRepository : BaseRepository<Spacer, int>, ISpacerRepository
{
    private readonly HttpClient _httpClient;
    private readonly string _eventBusUrl;

    private static readonly ConcurrentDictionary<string, TaskCompletionSource<WheelDetails>> _pendingRequests = new();

    public SpacerRepository(PostgreSqlContext dbContext, HttpClient httpClient) : base(dbContext)
    {
        _httpClient = httpClient;
        _eventBusUrl = Environment.GetEnvironmentVariable("EVENT_BUS_URL") 
                       ?? throw new InvalidOperationException("Missing environment variable: EVENT_BUS_URL");
    }

    public async Task<WheelDetails> GetWheelDetails(string make, string model, int year)
    {
        var correlationId = Guid.NewGuid().ToString();

        var eventPayload = new
        {
            EventType = "WheelDetailsRequest",
            Data = new
            {
                Make = make,
                Model = model,
                Year = year,
                CorrelationId = correlationId,
            }
        };
        
        Console.WriteLine(eventPayload);

        var tcs = new TaskCompletionSource<WheelDetails>();
        _pendingRequests[correlationId] = tcs;

        var response = await _httpClient.PostAsJsonAsync(_eventBusUrl, eventPayload);

        if (!response.IsSuccessStatusCode)
        {
            _pendingRequests.TryRemove(correlationId, out _);
            throw new Exception("Error publishing event WheelDetailsRequest");
        }

        using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(3));
        using (cts.Token.Register(() => tcs.TrySetCanceled()))
        {
            try
            {
                return await tcs.Task;
            }
            catch (TaskCanceledException)
            {
                _pendingRequests.TryRemove(correlationId, out _);
                throw new Exception("Timeout waiting wheel details");
            }
        }
    }
    
public static void ReceiveEventWebhook(EventWrapper eventPayload)
{
    TaskCompletionSource<WheelDetails>? tcs = null;

    if (eventPayload.EventType == "WheelDetailsResponse" &&
        _pendingRequests.TryRemove(eventPayload.Data.CorrelationId, out tcs) &&
        tcs != null)
    {
        var data = eventPayload.Data;
        var wheelDetails = new WheelDetails
        {
            Make = data.Make,
            Model = data.Model,
            Year = data.Year,
            BoltCount = data.BoltCount,
            BoltPattern = data.BoltPattern,
            CenterBore = data.CenterBore
        };
        tcs.SetResult(wheelDetails);
    }
}

}