---
id: timeout-policy-polly
title: Polly Timeout Policy
summary: Bound request duration to protect thread and connection pools.
framework: aspnet
version: .net8+
language: csharp
category: resilience
tags:
  - polly
  - timeout
  - resilience
difficulty: beginner
bestPractices:
  - Use per-operation timeout values from performance baselines
  - Distinguish client timeout from server deadline
pitfalls:
  - Timeouts that are too short cause self-induced failures
---

## Implementation

```csharp
// AddTimeoutPolicy(...) with operation-specific thresholds.
```
