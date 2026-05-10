---
id: saga-state-machine
title: Saga State Machine Basics
summary: Coordinate long-running workflows across distributed services.
framework: dotnet
version: .net8+
language: csharp
category: messaging
tags:
  - saga
  - state-machine
  - masstransit
difficulty: advanced
bestPractices:
  - Persist saga state durably
  - Define timeout and compensation transitions
pitfalls:
  - Missing idempotency in event handlers causes duplicate effects
---

## Implementation

```csharp
// Define states, events, transitions, and compensation steps.
```
