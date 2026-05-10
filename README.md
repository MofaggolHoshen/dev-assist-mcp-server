# README.md Structure for DevAssist MCP

````md id="j9f2tw"
# DevAssist MCP

Production-ready developer assistance through Model Context Protocol (MCP).

DevAssist MCP provides curated engineering snippets, architecture guidance, implementation examples, and best practices optimized for AI-assisted development workflows.

---

# Features

- MCP-compatible developer assistant
- Production-ready engineering snippets
- ASP.NET and backend-focused examples
- Version-aware implementations
- Explain engineering concepts
- AI-friendly structured responses
- Lightweight and extensible architecture

---

# Supported Categories

- JWT Authentication
- JWE
- Polly Retry Policies
- Circuit Breakers
- Serilog
- OpenTelemetry
- Redis Caching
- CQRS
- DDD
- Clean Architecture
- MassTransit
- Saga Pattern
- Rate Limiting
- Background Jobs

---

# Installation

## Using npm

```bash
npm install @mofaggolhoshen/dev-assist-mcp
```

---

# Quick Start

## Run the MCP Server

```bash
npx @mofaggolhoshen/dev-assist-mcp
```

---

# Claude Desktop Integration

Add the following configuration:

```json
{
  "mcpServers": {
    "dev-assist-mcp": {
      "command": "npx",
      "args": [
        "@mofaggolhoshen/dev-assist-mcp"
      ]
    }
  }
}
```

# VS Code Integration

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
---

# Example Prompts

## Search Snippets

```txt
Give me JWT authentication setup for ASP.NET 9
```

```txt
Show Polly retry with exponential backoff
```

---

## Explain Concepts

```txt
Explain Circuit Breaker pattern
```

```txt
Explain CQRS with example
```

---

# MCP Tools

| Tool | Description |
|---|---|
| search_snippet | Search reusable snippets |
| get_snippet | Retrieve detailed snippet |
| explain_concept | Explain engineering concepts |
| generate_setup | Generate production-ready setup |

---

# Example Response

```json
{
  "title": "JWT Authentication ASP.NET 9",
  "framework": ".net9",
  "summary": "Production-ready JWT setup",
  "bestPractices": [
    "Use short-lived access tokens"
  ]
}
```

---

# Architecture

```txt
AI Client
   ↓
DevAssist MCP Server
   ↓
Search Engine
   ↓
Markdown/JSON Snippets
```

---

# Repository Structure

```txt
src/
snippets/
examples/
docs/
tests/
```

---

# Development

## Install Dependencies

```bash
npm install
```

---

## Start Development Server

```bash
npm run dev
```

---

## Run Tests

```bash
npm run test
```

---

# Snippet Format

Example snippet metadata:

```yaml
id: jwt-auth-dotnet8
title: JWT Authentication ASP.NET 8
framework: .net8
tags:
  - jwt
  - authentication
difficulty: medium
```

---

# Contributing

Contributions are welcome.

Please read:
- CONTRIBUTING.md
- SNIPPET_GUIDE.md

before submitting pull requests.

---

# Goals

DevAssist MCP aims to improve AI-assisted software engineering by providing reliable, production-grade developer context.

---

# License

MIT

---

# Author

Mofaggol Hoshen

---

# Links

- GitHub Repository
- npm Package
- Documentation
- Examples
````
