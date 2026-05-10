---
id: serilog-bootstrap
title: Serilog Bootstrap Logger
summary: Capture startup exceptions and switch to configured logging pipeline.
framework: aspnet
version: .net8+
language: csharp
category: logging
tags:
  - serilog
  - logging
  - startup
difficulty: beginner
bestPractices:
  - Initialize bootstrap logger before host build
  - Include correlation ids in enrichers
pitfalls:
  - Delayed logger init loses early critical errors
---

## Implementation

```csharp
// Log.Logger = new LoggerConfiguration().WriteTo.Console().CreateBootstrapLogger();
```
