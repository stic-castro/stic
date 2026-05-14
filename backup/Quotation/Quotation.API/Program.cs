using DotNetEnv;
using Microsoft.EntityFrameworkCore;
using Quotation.API.Extensions;
using Quotation.Data.Abstract;
using Quotation.Data.Contexts;

var builder = WebApplication.CreateBuilder(args);

Env.Load();

builder.Services.AddProjectServices(builder.Configuration);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocal3000",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

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

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<PostgreSqlContext>();
    context.Database.Migrate();
}

app.UseHttpsRedirection();

app.UseCors("AllowLocal3000");

app.UseAuthorization();

app.MapGet("/health", () => Results.Ok());
app.MapControllers();

app.Run();
