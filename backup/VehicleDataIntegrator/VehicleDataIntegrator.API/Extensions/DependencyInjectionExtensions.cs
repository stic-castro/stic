using DotNetEnv;
using VehicleDataIntegrator.Domain.Models;

namespace VehicleDataIntegrator.API.Extensions;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Application.Abstract;
using Application.Concrete;
using Infrastructure.Concrete;

public static class DependencyInjectionExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
    {
        Env.Load();
        
        services.Configure<WheelFitmentSettings>(options =>
        {
            options.ApiKey = Environment.GetEnvironmentVariable("WHEELFITMENT_APIKEY");
            options.BaseUrl = Environment.GetEnvironmentVariable("WHEELFITMENT_BASEURL");
        });
        
        services.AddHttpClient<IWheelDetailsIntegration, WheelFitmentIntegration>();

        services.AddScoped<IWheelDetailsService, WheelFitmentService>();

        return services;
    }
}
