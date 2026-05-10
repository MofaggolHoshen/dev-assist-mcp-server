# DevAssist MCP - Comprehensive Implementation Plan

## 1. Purpose

This document translates the product requirements in PRD-v2.md into an execution plan for the current repository state.

The repository already provides a working stdio MCP server with these implemented tools:

- list_files
- read_file
- search_code
- get_snippet
- analyze_project

The objective is to evolve the project from a lightweight utility MCP server into a production-ready developer knowledge platform aligned with the PRD vision.

## 2. Current State Summary

### Implemented

- TypeScript MCP server using the MCP TypeScript SDK
- Tool registry abstraction for registering MCP tools
- File-system tools for file listing, reading, and keyword search
- Snippet retrieval from local JSON snippet storage
- Lightweight project analysis capability
- Jest-based automated tests for the core tool surface
- npm package publishing path already in use

### Gaps Relative to PRD v2

- No snippet search ranking beyond simple file/name lookup
- No concept explanation tool
- No template generation tool
- No setup generation tool
- No framework/version-aware filtering engine
- No semantic search or relevance scoring layer
- No formal content ingestion/indexing pipeline
- No operational metrics and structured telemetry

## 3. Guiding Principles

- Keep the server usable through every phase.
- Prefer structured JSON responses over ad hoc text payloads.
- Make content validation mandatory before scale-up.
- Separate knowledge content from search/indexing implementation.
- Ship deterministic local search before semantic search.
- Add version awareness as first-class metadata, not post-processing.
- Treat snippet quality and trustworthiness as product features.

## 4. Technology Stack

### MVP Stack

| Component  | Technology |
| ---------- | ---------- |
| Runtime    | Node.js    |
| Language   | TypeScript |
| MCP SDK    | MCP TypeScript SDK |
| Validation | Zod |
| Search     | Fuse.js |
| Logging    | Pino |
| Testing    | Jest |

### Future Stack

| Component | Technology |
| --------- | ---------- |
| Semantic Search | Qdrant |
| Embeddings | OpenAI |
| Dashboard | React |
| Enterprise API | ASP.NET Core |
| Database | PostgreSQL |

## 5. Target Architecture Evolution

### Phase 0 Architecture

Current architecture is a simple MCP server with local tools and local file-backed snippet storage.

### Target MVP Architecture

The MVP introduces these internal layers:

- content: snippet, template, concept, and setup schemas
- catalog: metadata loading, validation, indexing, and lookup
- ranking: deterministic scoring and filtering
- tools/knowledge: PRD-aligned MCP tools
- validation: schema validation and content integrity checks
- telemetry: timing, request counts, and error reporting hooks

### Future Architecture

After MVP, add:

- semantic embedding generation pipeline
- vector-backed retrieval abstraction
- richer explain and guidance composition engine
- optional web dashboard and team/private registries

## 6. Workstreams

### Workstream A - Content Model and Storage

Goal: define a durable content schema that supports snippets, templates, concepts, and setup guides.

Deliverables:

- Canonical JSON schema for snippet metadata
- Separate schema for templates and concepts
- Required metadata fields: id, name, title, category, tags, framework, version, language, difficulty
- Optional metadata fields: bestPractices, pitfalls, securityNotes, references, updatedAt
- Folder taxonomy aligned to PRD categories
- Validation script or test coverage to reject malformed content

Acceptance criteria:

- Every content file validates against schema
- Invalid content fails CI
- Content model supports version-aware filtering without custom exceptions

### Workstream B - Search and Retrieval

Goal: turn local content into a reliable knowledge catalog.

Deliverables:

- Index builder for local content files
- Deterministic search across title, tags, category, framework, and keywords
- Filter support for framework/version/category/difficulty
- Ranking strategy based on exact match, tag match, framework match, and content freshness
- Search response contract that returns structured objects instead of plain text blobs

Acceptance criteria:

- Search finds relevant results for PRD example queries
- Results are ranked consistently across runs
- Search latency stays under the PRD target for local datasets

### Workstream C - MCP Tool Surface

Goal: align the tool catalog with the PRD.

Deliverables:

- search_snippet
- get_template
- explain_concept
- generate_setup
- Shared response format for all knowledge tools
- Backward compatibility plan for existing tools or deprecation guidance

Acceptance criteria:

- Each PRD tool is implemented and registered
- Each tool has tests for success, empty result, and invalid input
- README and package usage examples reflect the new tool catalog

### Workstream D - Version Awareness

Goal: make framework and version matching explicit and dependable.

Deliverables:

- Framework/version metadata conventions
- Normalization rules for queries like .net 8, .NET8, asp.net 9
- Compatibility filters and fallback strategy
- Version scoring in result ranking
- Test cases for .NET version disambiguation

Acceptance criteria:

- Version-specific queries do not return incompatible content first
- Response payload indicates which version was matched
- Fallback behavior is deterministic and documented

### Workstream E - Quality, Trust, and Safety

Goal: improve reliability of AI-consumable outputs.

Deliverables:

- Required best-practices and pitfalls fields for key content types
- Security notes support for authentication and resilience content
- Content review checklist for production readiness
- Explicit missing-content responses to reduce hallucination risk

Acceptance criteria:

- High-value categories include best practices and pitfalls
- Missing content is surfaced clearly instead of inferred
- Output contracts minimize ambiguous freeform text

### Workstream F - Developer Experience and Operations

Goal: make the project easier to extend, validate, and publish.

Deliverables:

- Better npm package metadata and keywords
- CI workflow for build, test, and content validation
- Tooling for content indexing and validation
- Performance smoke tests for startup and search latency
- Release checklist for npm publishing
- Pino structured logging for tool execution, query performance, failures, and parsing errors

Acceptance criteria:

- Clean build and test pipeline in CI
- Publish process is repeatable
- Performance regressions are detectable before release

## 7. Phase Roadmap and Status

Status legend:

- Completed
- In Progress
- Not Started

| Phase | Status | Focus |
| ----- | ------ | ----- |
| Phase 1 - Foundation Hardening | Completed | Schema/response foundations, metadata normalization, baseline tests |
| Phase 2 - PRD MVP Delivery | Not Started | PRD tool set, content expansion, version-aware retrieval |
| Phase 3 - Relevance and Intelligence | Not Started | Ranking, normalization, quality signals |
| Phase 4 - Semantic Search and Platform Expansion | Not Started | Hybrid/semantic retrieval and ecosystem expansion |

Last status update: 2026-05-10

### Phase 1 - Foundation Hardening

Status: Completed

Objective: prepare the repository for growth without changing the product promise too quickly.

Scope:

- Refine project structure for content and search layers
- Introduce shared response types for knowledge tools
- Define and validate content schemas
- Normalize snippet storage format
- Improve README and package metadata
- Ensure tests cover current behavior and new shared abstractions

Outputs:

- Stable content contracts
- Validation utilities
- Cleaner internal architecture

Completion summary:

- Added shared response helpers in src/shared/response.ts
- Added canonical snippet schema in src/content/snippetSchema.ts
- Updated get_snippet to parse canonical schema and render richer metadata sections
- Normalized existing snippet files with Phase 1 metadata
- Added schema validation tests including full snippets directory validation
- Added base folder structure for server/services/search/storage/validation/schemas/utils/types and catalog/content/ranking/shared
- Added planned snippet category subfolders (auth, resilience, logging, architecture, messaging, caching)
- Added top-level scaffolding folders examples/ and scripts/
- Improved package metadata keywords and updated README snippet authoring schema

Exit criteria:

- Repository builds cleanly
- Tests cover core abstractions
- Content format is formally defined

### Phase 2 - PRD MVP Delivery

Status: Not Started

Objective: deliver the minimum product promised in the PRD using file-based storage.

Scope:

- Implement search_snippet
- Implement get_template
- Implement explain_concept
- Implement generate_setup
- Add categorized content for Authentication, Resilience, Logging, Architecture, Caching, and Messaging
- Add version-aware matching for initial .NET-focused content

Outputs:

- PRD-aligned tool catalog
- Local search MVP
- Richer knowledge assets

Exit criteria:

- PRD example queries return relevant structured results
- Latency goals are met on representative local content size
- README documents all public tools
- Minimum 20 production-ready snippets across priority categories

### Phase 3 - Relevance and Intelligence

Status: Not Started

Objective: improve result quality before adding semantic infrastructure.

Scope:

- Add deterministic ranking and scoring
- Add synonym mapping and query normalization
- Add richer explanation assembly using metadata plus content sections
- Add content freshness/version precedence rules
- Add result confidence indicators where appropriate

Outputs:

- Better search relevance
- Clearer output quality signals
- Reduced ambiguity for AI clients

Exit criteria:

- Search quality measurably improves on a curated benchmark set
- Version-aware behavior is stable and test-covered

### Phase 4 - Semantic Search and Platform Expansion

Status: Not Started

Objective: move beyond local keyword retrieval into intent-aware knowledge discovery.

Scope:

- Embedding generation pipeline
- Vector store integration abstraction
- Semantic retrieval with hybrid ranking
- Dashboard and private/team registry planning
- Extension and CLI expansion

Outputs:

- Semantic search foundation
- Platform-ready architecture

Exit criteria:

- Hybrid retrieval works on benchmark queries
- Vector integration is optional and does not break local-only mode

## 8. Detailed Backlog by Area

### Content and Schema

- Create shared TypeScript types for snippet/template/concept/setup content
- Add Zod schemas for all content types
- Add content fixtures for tests
- Define required sections for production-ready content

Each snippet should follow this standard structure:

```
Title
Summary
Installation
Configuration
Implementation
Best Practices
Pitfalls
Related Concepts
References
```

### Tooling and Server

- Extract shared tool response helpers
- Support structured JSON outputs where useful
- Add error envelopes for invalid queries and missing content
- Keep naming consistent with MCP tool conventions

### Search

- Build file loader and in-memory catalog
- Implement indexing on startup
- Use Fuse.js for fuzzy, typo-tolerant search across title, tags, category, and framework
- Add exact and partial keyword matching
- Add filtering by metadata
- Add ranking weights and benchmark tests

Search types to support:

| Type | Description |
| ---- | ----------- |
| Exact Search | Direct title match |
| Fuzzy Search | Typo-tolerant |
| Tag Search | Category filtering |
| Framework Search | Version-aware |
| Semantic Search | Future phase |

### Testing

Unit tests:

- Add unit tests per tool
- Add catalog/indexing tests
- Add content validation tests
- Add search ranking and scoring tests
- Add query normalization and version parsing tests

Integration tests:

- Add regression tests for version matching
- Add end-to-end smoke tests for MCP startup and tool invocation
- Add snippet loading and response formatting tests

Future tests:

- Semantic ranking quality benchmarks
- AI response quality validation

### Documentation

- Update README tool catalog
- Add content authoring guidance
- Add version-tagging guidance
- Add release and contribution instructions

## 9. Suggested Repository Changes

### Recommended Folder Structure

```
dev-assist-mcp-server/
|
|-- src/
|   |-- server/
|   |-- services/
|   |-- storage/
|   |-- validation/
|   |-- schemas/
|   |-- utils/
|   |-- types/
|   |-- content/
|   |-- catalog/
|   |-- ranking/
|   |-- search/
|   |-- shared/
|   |-- tools/
|   |   |-- knowledge/
|
|-- snippets/
|   |-- auth/
|   |-- resilience/
|   |-- logging/
|   |-- architecture/
|   |-- messaging/
|   |-- caching/
|
|-- tests/
|   |-- catalog/
|   |-- tools/
|       |-- knowledge/
|-- docs/
|-- examples/
|-- scripts/
|-- package.json
```

### Recommended File Additions

- src/tools/knowledge/searchSnippet.ts
- src/tools/knowledge/getTemplate.ts
- src/tools/knowledge/explainConcept.ts
- src/tools/knowledge/generateSetup.ts
- tests/catalog/
- tests/tools/knowledge/

Recommended cleanups:

- Decide whether ping remains public or stays test-only
- Standardize import patterns and tool registration layout
- Align package versioning and server version reporting

## 10. Milestones

### Milestone 1 - Content Foundation

- Schemas defined
- Sample content normalized
- Validation added to tests/CI

### Milestone 2 - MVP Tool Alignment

- PRD tool set implemented
- README updated
- Local search working against categorized content

### Milestone 3 - Version-Aware Relevance

- Framework/version filters stable
- Ranking tuned
- Benchmark queries added

### Milestone 4 - Intelligent Retrieval

- Semantic retrieval abstraction added
- Hybrid search prototype available

## 11. Suggested Timeline

If developed incrementally by a small team:

1. Week 1-2: content model, schemas, validation, and repository restructuring
2. Week 3-4: implement PRD MVP tools and content expansion
3. Week 5: version-aware filtering and ranking
4. Week 6: documentation, CI hardening, and release preparation
5. Later phase: semantic search and platform expansion

This timeline is sequencing guidance, not a rigid schedule.

## 12. Risks and Mitigations

### Risk: content quality lags behind feature delivery

Mitigation:

- Require schema validation
- Add content review checklist
- Prioritize fewer high-quality categories first

### Risk: semantic search is introduced too early

Mitigation:

- Ship deterministic search first
- Establish benchmark queries before embedding work

### Risk: tool outputs become inconsistent across features

Mitigation:

- Define shared response contracts early
- Centralize response formatting helpers

### Risk: version-aware matching becomes brittle

Mitigation:

- Normalize query tokens
- Encode compatibility in metadata
- Add regression tests for known framework queries

### Risk: local file storage becomes hard to manage at scale

Mitigation:

- Keep storage abstracted behind catalog loaders
- Design schemas so they can later map to database/vector storage

## 13. Success Metrics

### Technical

- Search latency under 500 ms on local corpus
- MCP response under 1 second for common tool calls
- Startup under 5 seconds on representative content size
- High test pass rate for tools and content validation

### Product

- PRD example queries return useful results
- Increased breadth of production-ready content across target categories
- Reduced ambiguity in AI tool outputs
- Smoother adoption through npm and MCP client integration

## 14. Immediate Next Actions

1. Build a local content catalog loader with validation.
2. Implement search_snippet on top of the catalog.
3. Add structured metadata to expanded snippet taxonomy.
4. Implement get_template, explain_concept, and generate_setup.
5. Add version-aware ranking and benchmark tests.
6. Update README and release metadata.

## 15. Recommended Definition of Done for MVP

The MVP should be considered done when:

- The MCP server exposes the PRD tool set
- Responses are structured and test-covered
- Content is validated and categorized
- .NET-focused version-aware retrieval is working
- Documentation explains usage and content authoring
- Local performance targets are met on representative data

## 16. Final Recommendation

The highest-leverage path is to avoid jumping directly into semantic search or dashboard work. The current codebase is well-positioned to become a strong PRD-aligned MVP if the next effort focuses on structured content, deterministic retrieval, version awareness, and high-trust output contracts.
