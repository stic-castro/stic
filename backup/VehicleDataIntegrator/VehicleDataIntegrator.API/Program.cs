using VehicleDataIntegrator.API.Extensions;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddApplicationServices(builder.Configuration);

Console.WriteLine("EVENT_BUS_PUBLISH_URL = " + Environment.GetEnvironmentVariable("EVENT_BUS_PUBLISH_URL"));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "v1");
        options.RoutePrefix = string.Empty;
    });
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapGet("/health", () => Results.Ok());
app.MapControllers();
app.Run();
