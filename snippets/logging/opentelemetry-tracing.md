---
id: opentelemetry-tracing
title: OpenTelemetry Tracing Setup
summary: Add distributed tracing with ASP.NET and outbound HTTP instrumentation.
framework: aspnet
version: .net8+
language: csharp
category: logging
tags:
  - opentelemetry
  - tracing
  - observability
difficulty: medium
bestPractices:
  - Propagate trace context across service boundaries
  - Export traces to centralized backend
pitfalls:
  - Sampling too low during incident response obscures root cause
---

## Implementation

```csharp
// builder.Services.AddOpenTelemetry().WithTracing(...)
```
