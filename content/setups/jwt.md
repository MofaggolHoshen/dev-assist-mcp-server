---
id: jwt
title: JWT Setup Baseline
summary: Production-oriented JWT setup checklist for ASP.NET APIs.
framework: aspnet
version: .net8+
tags:
  - jwt
  - auth
  - security
---

## Setup Checklist

1. Add JwtBearer package.
2. Configure issuer, audience, and signing key validation.
3. Enforce HTTPS and secure secret storage.
4. Add authorization policies and role checks.
5. Add token expiry and refresh-token strategy.

## Validation

- Reject tokens with invalid issuer or audience.
- Reject expired tokens.
- Rotate keys safely.
