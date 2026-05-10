---
id: circuit-breaker
title: Circuit Breaker Pattern
summary: Protect downstream systems by stopping repeated calls during failures.
tags:
  - resilience
  - polly
  - reliability
---

## Concept

A circuit breaker monitors failures and opens when a threshold is crossed. While open, calls fail fast.
After a delay, it enters half-open mode to test recovery.

## When to Use

- Unstable downstream API
- Expensive external dependency
- Cascading-failure protection

## Anti-Patterns

- Using retries without a breaker for persistent failures
- Very long open durations that block recovery
