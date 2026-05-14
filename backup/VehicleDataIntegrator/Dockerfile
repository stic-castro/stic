FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY VehicleDataIntegrator.sln ./
COPY VehicleDataIntegrator.API/VehicleDataIntegrator.API.csproj VehicleDataIntegrator.API/
COPY VehicleDataIntegrator.Application/VehicleDataIntegrator.Application.csproj VehicleDataIntegrator.Application/
COPY VehicleDataIntegrator.Infrastructure/VehicleDataIntegrator.Infrastructure.csproj VehicleDataIntegrator.Infrastructure/
COPY VehicleDataIntegrator.Domain/VehicleDataIntegrator.Domain.csproj VehicleDataIntegrator.Domain/

RUN dotnet restore VehicleDataIntegrator.API/VehicleDataIntegrator.API.csproj

COPY . .

RUN dotnet publish VehicleDataIntegrator.API/VehicleDataIntegrator.API.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "VehicleDataIntegrator.API.dll"]
