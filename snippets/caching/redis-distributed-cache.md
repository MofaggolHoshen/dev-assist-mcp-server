---
id: redis-distributed-cache
title: Redis Distributed Cache Setup
summary: Configure Redis cache provider for shared low-latency data access.
framework: aspnet
version: .net8+
language: csharp
category: caching
tags:
  - redis
  - cache
  - distributed
difficulty: beginner
bestPractices:
  - Set TTL based on freshness requirements
  - Use namespaced cache keys
pitfalls:
  - Very large values increase serialization overhead and latency
---

## Implementation

```csharp
// builder.Services.AddStackExchangeRedisCache(...)
```
