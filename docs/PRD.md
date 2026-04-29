# 📄 PRD: DevAssist MCP Server (TypeScript)

---

## 1. 🧭 Overview

**Product Name:** DevAssist MCP  
**Type:** Model Context Protocol (MCP) Server  
**Platform:** Node.js (TypeScript)  
**Protocol:** stdio-based JSON RPC  

**Goal:**  
Provide structured, real-time development context to AI tools (Copilot / ChatGPT MCP clients) to improve developer productivity.

---

## 2. 🎯 Objectives

- Make AI-assisted development context-aware  
- Expose local project data (code, structure, configs)  
- Centralize reusable developer knowledge  
- Enable multi-project / multi-tenant support  

---

## 3. 👤 Target Users

- Software Developers (.NET / JS / Full-stack)  
- Freelancers handling multiple projects  
- Teams using AI-assisted coding tools  

---

## 4. 🚫 Non-Goals

- Not a full IDE replacement  
- No code execution engine  
- No heavy indexing system (like Elasticsearch)  
- No cloud dependency (v1 → local-first)  

---

## 5. ⚙️ Core Features

### 5.1 📂 File System Tools

#### list_files
- Returns project file structure  

#### read_file
- Reads file content  

#### search_code
- Keyword-based search across files  

---

### 5.2 🧠 Knowledge Tools

#### get_snippet
- Provides reusable code snippets  
- Examples:
  - Retry policy (Polly)
  - EF Core patterns
  - JWT setup  

---

### 5.3 🔍 Project Intelligence

#### analyze_project
- Detect:
  - Language (.NET, Node.js)
  - Framework (ASP.NET Core, React)
  - Basic architecture patterns  

---

### 5.4 🧩 Extensible Tool System

- Plugin-based tool registration  
- Easy to add custom tools  

---

## 6. 🔌 MCP Tool Contract

### Request
```json
{
  "tool": "read_file",
  "input": {
    "path": "src/index.ts"
  }
}