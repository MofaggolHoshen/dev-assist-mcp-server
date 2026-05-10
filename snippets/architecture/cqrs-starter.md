---
id: cqrs-starter
title: CQRS Starter Pattern
summary: Separate command and query models for clearer responsibilities.
framework: dotnet
version: .net8+
language: csharp
category: architecture
tags:
  - cqrs
  - architecture
  - mediator
difficulty: medium
bestPractices:
  - Keep commands side-effect focused
  - Keep queries read-optimized and idempotent
pitfalls:
  - Applying CQRS to trivial CRUD adds complexity
---

## Implementation

```csharp
// Define CreateOrderCommand and GetOrderByIdQuery handlers separately.
```
