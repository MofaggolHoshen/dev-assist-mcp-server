---
id: circuit-breaker-polly
title: Polly Circuit Breaker
summary: Fail fast after repeated errors and allow recovery windows.
framework: aspnet
version: .net8+
language: csharp
category: resilience
tags:
  - polly
  - circuit-breaker
  - resilience
difficulty: medium
bestPractices:
  - Configure thresholds based on service SLOs
  - Combine with retry and timeout policies
pitfalls:
  - Opening breaker too aggressively can block healthy traffic
---

## Implementation

```csharp
// AddCircuitBreakerAsync(...) on HttpClient policy chain.
```
