---
id: clean-architecture
title: Clean Architecture Starter Template
summary: Baseline folder and project layering for a Clean Architecture solution.
framework: dotnet
version: .net8+
tags:
  - clean-architecture
  - ddd
  - layering
---

## Suggested Structure

- src/Application
- src/Domain
- src/Infrastructure
- src/WebApi

## Core Rules

1. Domain has no dependency on infrastructure.
2. Application contains use cases and contracts.
3. Infrastructure implements contracts and adapters.
4. Web API composes dependencies and hosts endpoints.
