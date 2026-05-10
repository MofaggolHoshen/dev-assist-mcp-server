---
id: bulkhead-isolation
title: Bulkhead Isolation for External Calls
summary: Limit concurrency to isolate failures in heavy dependencies.
framework: aspnet
version: .net8+
language: csharp
category: resilience
tags:
  - bulkhead
  - concurrency
  - resilience
difficulty: advanced
bestPractices:
  - Set queue and parallelism based on load tests
  - Protect critical paths with separate bulkheads
pitfalls:
  - Shared bulkhead for unrelated dependencies causes coupling
---

## Implementation

```csharp
// AddBulkheadPolicy(...) with per-dependency limits.
```
