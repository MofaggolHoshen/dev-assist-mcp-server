---
id: outbox-pattern
title: Transactional Outbox Pattern
summary: Ensure reliable event publishing with database consistency.
framework: dotnet
version: .net8+
language: csharp
category: messaging
tags:
  - outbox
  - reliability
  - messaging
difficulty: advanced
bestPractices:
  - Write outbox records in the same DB transaction as business changes
  - Use background dispatcher with retry and dedupe
pitfalls:
  - Deleting outbox rows before successful publish acknowledgment
---

## Implementation

```csharp
// Persist integration event to outbox table inside transaction.
```
