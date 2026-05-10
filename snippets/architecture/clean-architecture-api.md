---
id: clean-architecture-api
title: Clean Architecture API Composition
summary: Compose API, application, domain, and infrastructure layers.
framework: dotnet
version: .net8+
language: csharp
category: architecture
tags:
  - clean-architecture
  - layering
  - api
difficulty: medium
bestPractices:
  - Keep dependency flow inward only
  - Register infrastructure implementations in composition root
pitfalls:
  - Leaking EF entities into API contract layer
---

## Implementation

```csharp
// Configure service registrations at startup by layer.
```
