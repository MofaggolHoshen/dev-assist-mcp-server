# DevAssist MCP

Production-ready developer assistance through Model Context Protocol (MCP).

DevAssist MCP is an AI-first developer knowledge server that provides curated snippets, setup guides, architecture templates, concept explanations, and project analysis for modern engineering workflows.

## Why DevAssist MCP

AI-generated code is often incomplete, outdated, or missing production context. DevAssist MCP improves output quality by returning structured, version-aware, reusable engineering knowledge instead of generic examples.

## Key Capabilities

- MCP-compatible stdio server
- Production-ready, curated engineering content
- Framework and version-aware retrieval
- Deterministic ranking with confidence signals
- Explain mode for engineering concepts
- Setup generation for common backend scenarios
- Template retrieval for architecture starters
- File-system and project analysis utility tools
- Structured responses optimized for AI clients

## Supported Domains

- Authentication: JWT, JWE, role-based authorization, refresh-token rotation
- Resilience: retry, timeout, circuit breaker, fallback, bulkhead
- Observability: Serilog, OpenTelemetry tracing, structured logging
- Architecture: Clean Architecture, CQRS, DDD, repository patterns
- Messaging: MassTransit, RabbitMQ, outbox, saga state machine
- Caching: Redis distributed cache, cache-aside

## Installation

### npm

```bash
npm install @mofaggolhoshen/dev-assist-mcp
```

### Run with npx

```bash
npx -y @mofaggolhoshen/dev-assist-mcp
```

## MCP Client Integration

### Claude Desktop

```json
{
  "mcpServers": {
    "dev-assist-mcp": {
      "command": "npx",
      "args": ["-y", "@mofaggolhoshen/dev-assist-mcp"]
    }
  }
}
```

### VS Code MCP

```json
{
  "servers": {
    "dev-assist": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@mofaggolhoshen/dev-assist-mcp"]
    }
  }
}
```

## MCP Tools

| Tool            | Purpose                                                    |
| --------------- | ---------------------------------------------------------- |
| search_snippet  | Search reusable engineering snippets with optional filters |
| get_snippet     | Retrieve a detailed snippet by name                        |
| get_template    | Return complete implementation templates                   |
| explain_concept | Explain engineering concepts with practical guidance       |
| generate_setup  | Generate production-ready setup guidance                   |

## Example Prompts

- Give me JWT authentication setup for ASP.NET 9
- Show Polly retry with exponential backoff
- Explain circuit breaker pattern
- Get clean architecture template
- Analyze this repository structure

## Example Structured Response

```json
{
  "query": "jwt authentication asp.net 9",
  "filters": {
    "framework": ".net",
    "version": "9",
    "category": "auth",
    "difficulty": "medium",
    "limit": 10
  },
  "total": 1,
  "results": [
    {
      "id": "jwt-setup-dotnet9",
      "title": "JWT Authentication ASP.NET 9",
      "framework": ".net",
      "version": "9",
      "difficulty": "medium",
      "confidence": "high",
      "reasons": ["framework-match", "version-match", "tag-match"]
    }
  ]
}
```

## Architecture (MVP)

```txt
AI Client (Copilot / Cursor / Claude)
            |
            v
DevAssist MCP Server (TypeScript MCP SDK)
            |
            v
Catalog + Ranking + Validation Layers
            |
            v
Markdown Knowledge Store (snippets, templates, concepts, setups)
```

## Repository Layout

```txt
src/
  tools/
  storage/
  ranking/
  catalog/
  content/
snippets/
content/
  concepts/
  templates/
  setups/
examples/
docs/
tests/
```

## Development

### Install dependencies

```bash
npm install
```

### Run in development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Run tests

```bash
npm run test
```

## Content Authoring Format

Knowledge content uses Markdown with YAML frontmatter.

### Snippet frontmatter example

```yaml
---
id: jwt-setup-dotnet9
name: jwt-setup-dotnet9
title: JWT Authentication ASP.NET 9
summary: Production-ready JWT authentication setup for ASP.NET 9 APIs
framework: aspnet
version: .net9
language: csharp
category: auth
tags:
  - jwt
  - authentication
  - bearer
difficulty: medium
bestPractices:
  - Use short-lived access tokens
pitfalls:
  - Do not hardcode signing keys
securityNotes:
  - Store secrets in a secure secret manager
updatedAt: 2026-05-10
---
```

## Non-Functional Targets

- Snippet search target: under 500ms
- MCP response target: under 1 second
- Startup target: under 5 seconds

## Roadmap Status

- Phase 1 Foundation Hardening: Completed
- Phase 2 PRD MVP Delivery: Completed
- Phase 3 Relevance and Intelligence: Completed
- Phase 4 Semantic Search and Platform Expansion: Not Started

## Contributing

Contributions are welcome through pull requests and issues.

## License

ISC

## Author

Mofaggol Hoshen

## Links

- Repository: https://github.com/MofaggolHoshen/dev-assist-mcp-server
- Package: https://www.npmjs.com/package/@mofaggolhoshen/dev-assist-mcp
- Product Requirements: docs/PRD-v2.md
- Implementation Plan: docs/Implementation-Plan.md
