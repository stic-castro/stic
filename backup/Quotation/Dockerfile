FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY Quotation.sln ./
COPY Quotation.API/Quotation.API.csproj Quotation.API/
COPY Quotation.Application/Quotation.Application.csproj Quotation.Application/
COPY Quotation.Data/Quotation.Data.csproj Quotation.Data/
COPY Quotation.Domain/Quotation.Domain.csproj Quotation.Domain/

RUN dotnet restore Quotation.API/Quotation.API.csproj

COPY . .

RUN dotnet publish Quotation.API/Quotation.API.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Quotation.API.dll"]
