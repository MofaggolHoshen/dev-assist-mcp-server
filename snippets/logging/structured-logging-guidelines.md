---
id: structured-logging-guidelines
title: Structured Logging Guidelines
summary: Build queryable logs with consistent properties and event ids.
framework: dotnet
version: .net8+
language: csharp
category: logging
tags:
  - structured-logging
  - observability
  - serilog
difficulty: beginner
bestPractices:
  - Use named properties not interpolated strings
  - Attach tenant, user, and correlation context consistently
pitfalls:
  - Logging secrets or PII in structured properties
securityNotes:
  - Redact sensitive data before log emission
---

## Implementation

```csharp
logger.LogInformation("Order created {OrderId} for {CustomerId}", orderId, customerId);
```
