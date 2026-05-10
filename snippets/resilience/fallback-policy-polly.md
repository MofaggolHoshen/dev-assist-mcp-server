---
id: fallback-policy-polly
title: Polly Fallback Policy
summary: Return controlled fallback responses when dependencies fail.
framework: aspnet
version: .net8+
language: csharp
category: resilience
tags:
  - polly
  - fallback
  - resilience
difficulty: medium
bestPractices:
  - Keep fallback responses explicit and observable
  - Emit logs and metrics when fallback is triggered
pitfalls:
  - Silent fallback can hide outages from operators
---

## Implementation

```csharp
// AddFallbackAsync(...) with domain-safe default response.
```
