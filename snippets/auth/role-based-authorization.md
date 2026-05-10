---
id: role-based-authorization
title: Role-Based Authorization Policies
summary: Define policy-based authorization rules using roles and claims.
framework: aspnet
version: .net8+
language: csharp
category: auth
tags:
  - authorization
  - roles
  - policies
difficulty: beginner
bestPractices:
  - Prefer policies over hardcoded role checks in controllers
  - Keep policy names stable and domain-oriented
pitfalls:
  - Embedding authorization logic directly in business services
---

## Implementation

```csharp
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("CanManageUsers", p => p.RequireRole("Admin"));
});
```
