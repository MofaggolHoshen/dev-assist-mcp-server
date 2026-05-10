---
id: polly-retry
title: Polly Retry Policy (.NET)
summary: Configures an HTTP retry policy with exponential backoff using Polly.
framework: aspnet
version: .net8+
language: csharp
category: resilience
tags:
  - retry
  - resilience
  - polly
  - http
  - exponential-backoff
difficulty: medium
bestPractices:
  - Use exponential backoff to avoid overwhelming a failing service
  - Combine retry with circuit breaker for comprehensive resilience
  - Log each retry attempt for observability
pitfalls:
  - Avoid retrying non-transient errors such as 400 Bad Request or 401 Unauthorized
  - Do not use a fixed delay in high-concurrency scenarios; exponential backoff with jitter is preferred
---

## Implementation

```csharp
builder.Services.AddHttpClient("MyClient")
  .AddTransientHttpErrorPolicy(p =>
    p.WaitAndRetryAsync(3, attempt => TimeSpan.FromSeconds(Math.Pow(2, attempt))));
```
