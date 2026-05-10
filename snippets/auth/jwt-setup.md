---
id: jwt-setup
title: JWT Authentication Setup (ASP.NET Core)
summary: Configures JWT bearer authentication with token validation parameters.
framework: aspnet
version: .net8+
language: csharp
category: auth
tags:
  - jwt
  - authentication
  - bearer
  - aspnet
  - security
difficulty: medium
bestPractices:
  - Always validate issuer and audience to prevent token misuse
  - Store signing keys in environment variables or a secrets manager
  - Use short-lived access tokens with refresh token rotation
pitfalls:
  - Omitting audience or issuer validation opens the server to token substitution attacks
  - Using a weak or short signing key reduces security
securityNotes:
  - Signing keys for HS256 should be at least 32 bytes
  - Use HTTPS exclusively to protect bearer tokens in transit
---

## Implementation

```csharp
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = config["Jwt:Issuer"],
            ValidAudience = config["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!))
        };
    });
```
