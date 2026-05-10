---
id: masstransit-rabbitmq
title: MassTransit with RabbitMQ
summary: Configure message bus, consumers, and retry policies.
framework: dotnet
version: .net8+
language: csharp
category: messaging
tags:
  - masstransit
  - rabbitmq
  - messaging
difficulty: medium
bestPractices:
  - Use consumer definitions for endpoint consistency
  - Configure retry and dead-letter policies
pitfalls:
  - Sharing queues across unrelated consumers
---

## Implementation

```csharp
// services.AddMassTransit(x => { ... });
```
