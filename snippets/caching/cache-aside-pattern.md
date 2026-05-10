---
id: cache-aside-pattern
title: Cache-Aside Pattern
summary: Load from cache first, then source of truth on misses.
framework: dotnet
version: .net8+
language: csharp
category: caching
tags:
  - cache-aside
  - caching
  - performance
difficulty: beginner
bestPractices:
  - Cache misses should populate cache with sensible expiration
  - Use stale-while-revalidate for hot paths when appropriate
pitfalls:
  - No eviction strategy causes stale data and memory growth
---

## Implementation

```csharp
// Try cache, fetch DB on miss, then set cache.
```
