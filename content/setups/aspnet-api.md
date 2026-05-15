---
id: aspnet-api
title: ASP.NET Core Web API Setup
summary: Production-ready setup checklist for a new ASP.NET Core Web API project.
framework: aspnet
version: .net8+
tags:
  - aspnet
  - api
  - dotnet
  - webapi
  - setup
---

## 1. Create the Project

```bash
dotnet new webapi -n MyApi --use-controllers
cd MyApi
```

## 2. Essential NuGet Packages

```bash
dotnet add package Serilog.AspNetCore
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package Microsoft.AspNetCore.OpenApi
dotnet add package Scalar.AspNetCore
```

## 3. Program.cs Structure

```csharp
var builder = WebApplication.CreateBuilder(args);

// Logging
builder.Host.UseSerilog((ctx, lc) =>
    lc.ReadFrom.Configuration(ctx.Configuration));

// Services
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddHealthChecks();

// Auth (add if needed)
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => { /* configure */ });
builder.Services.AddAuthorization();

var app = builder.Build();

// Middleware pipeline (order matters)
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/health");
app.MapOpenApi();

app.Run();
```

## 4. appsettings.json Baseline

```json
{
  "Logging": {
    "LogLevel": { "Default": "Information" }
  },
  "Serilog": {
    "MinimumLevel": { "Default": "Information" }
  },
  "AllowedHosts": "*"
}
```

## 5. Setup Checklist

- [ ] Configure structured logging (Serilog)
- [ ] Add JWT authentication if the API is secured
- [ ] Add health check endpoint (`/health`)
- [ ] Add OpenAPI/Scalar for documentation
- [ ] Use `IOptions<T>` for all configuration binding
- [ ] Add global exception handling middleware
- [ ] Enforce HTTPS
- [ ] Use `CancellationToken` in all controller actions
- [ ] Add rate limiting for public endpoints

## Best Practices

- Keep `Program.cs` clean — move service registrations into extension methods
- Never hardcode secrets — use environment variables or a secrets manager
- Use `ProblemDetails` for consistent error responses
- Add `[ApiController]` attribute to all controllers
- Enable nullable reference types in the project file

## Related Snippets

- `jwt-setup-dotnet9` — full JWT authentication setup
- `serilog-bootstrap` — structured logging with Serilog
- `clean-architecture-api` — full project structure template
