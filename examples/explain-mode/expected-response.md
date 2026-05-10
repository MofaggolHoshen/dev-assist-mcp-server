# Circuit Breaker

Circuit Breaker prevents repeated calls to a failing dependency by opening the circuit after failure thresholds are crossed.

## Metadata
- Framework: dotnet
- Version: .net8
- Tags: resilience, retry, faults

## Why it matters
- Reduces cascading failures
- Improves recovery behavior under downstream outages

## Related Snippets
- polly-retry: Polly Retry Policy (high, score=0.82)
- polly-circuit-breaker: Polly Circuit Breaker Policy (high, score=0.80)
