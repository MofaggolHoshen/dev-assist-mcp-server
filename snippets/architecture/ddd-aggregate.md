---
id: ddd-aggregate
title: DDD Aggregate Root Rules
summary: Enforce domain invariants through aggregate boundaries.
framework: dotnet
version: .net8+
language: csharp
category: architecture
tags:
  - ddd
  - aggregate
  - domain-model
difficulty: advanced
bestPractices:
  - Expose behavior methods rather than setters
  - Keep invariants inside aggregate root
pitfalls:
  - Directly mutating child entities from outside aggregate
---

## Implementation

```csharp
// Aggregate root methods validate invariants before state changes.
```
