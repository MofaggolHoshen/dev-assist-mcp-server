---
id: refresh-token-rotation
title: Refresh Token Rotation
summary: Secure refresh flow that invalidates tokens after each use.
framework: aspnet
version: .net8+
language: csharp
category: auth
tags:
  - refresh-token
  - auth
  - security
difficulty: medium
bestPractices:
  - Rotate refresh tokens on every successful exchange
  - Track token family and revoke on reuse detection
pitfalls:
  - Long-lived reusable refresh tokens increase takeover risk
securityNotes:
  - Hash refresh tokens before persistence
---

## Implementation

```csharp
// Issue new refresh token and revoke previous token atomically.
```
