using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Quotation.Application.Abstract;
using Quotation.Application.Concrete;
using Quotation.Data.Abstract;
using Quotation.Data.Concrete;
using Quotation.Data.Contexts;

namespace Quotation.API.Extensions;

public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddProjectServices(this IServiceCollection services, IConfiguration configuration)
        {
            services
                .AddDatabase(configuration)
                .AddApplicationLayer()
                .AddInfrastructureLayer()
                .AddAutoMapperSetup()
                .AddControllersSetup()
                .AddSwaggerDocumentation();

            return services;
        }

        private static IServiceCollection AddDatabase(this IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING")
                                   ?? configuration.GetConnectionString("DefaultConnection");

            services.AddDbContext<PostgreSqlContext>(options =>
                options.UseNpgsql(connectionString)); 

            return services;
        }
        
        private static IServiceCollection AddInfrastructureLayer(this IServiceCollection services)
        {
            services.AddScoped<IGearRepository, GearRepository>();
            services.AddScoped<ISpacerRepository, SpacerRepository>();
            services.AddScoped<IMaterialRepository, MaterialRepository>();
            services.AddScoped<IPulleyRepository, PulleyRepository>();
            services.AddHttpClient<ISpacerRepository, SpacerRepository>();
            return services;
        }

        private static IServiceCollection AddApplicationLayer(this IServiceCollection services)
        {
            services.AddScoped<IGearService, GearService>();
            services.AddScoped<ISpacerService, SpacerService>();
            services.AddScoped<IMaterialService, MaterialService>();
            services.AddScoped<IPulleyService, PulleyService>();
            return services;
        }

        private static IServiceCollection AddAutoMapperSetup(this IServiceCollection services)
        {
            services.AddAutoMapper(typeof(Program));
            return services;
        }

        private static IServiceCollection AddControllersSetup(this IServiceCollection services)
        {
            services.AddControllers();
            return services;
        }

        private static IServiceCollection AddSwaggerDocumentation(this IServiceCollection services)
        {
            services.AddEndpointsApiExplorer();

            services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "Quotation API",
                    Version = "v1"
                });
            });

            return services;
        }
    }