import fs from "node:fs/promises";
import path from "node:path";
import { glob } from "glob";
import { z } from "zod";
import { Tool } from "../types.js";
import { resolveSafePath } from "../fs/safePath.js";

type AnalyzeProjectResult = {
  language: string[];
  framework: string[];
  architecture: string[];
  containerized: boolean;
  multi_container: boolean;
  files_count: number;
};

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function detectFromPackageJson(
  projectDir: string,
  result: AnalyzeProjectResult,
) {
  const packageJsonPath = path.join(projectDir, "package.json");
  if (!(await fileExists(packageJsonPath))) {
    return;
  }

  if (!result.language.includes("JavaScript")) {
    result.language.push("JavaScript");
  }
  if (!result.framework.includes("Node.js")) {
    result.framework.push("Node.js");
  }

  try {
    const raw = await fs.readFile(packageJsonPath, "utf-8");
    const pkg = JSON.parse(raw) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };

    const deps = {
      ...(pkg.dependencies ?? {}),
      ...(pkg.devDependencies ?? {}),
    };

    if (deps.typescript && !result.language.includes("TypeScript")) {
      result.language.push("TypeScript");
    }

    if (
      deps["@modelcontextprotocol/sdk"] &&
      !result.framework.includes("MCP SDK")
    ) {
      result.framework.push("MCP SDK");
    }
  } catch {
    // Skip malformed package.json and continue returning partial analysis.
  }
}

export const analyzeProjectTool: Tool = {
  name: "analyze_project",
  description:
    "Analyzes project structure to detect language, framework, and architecture hints",
  inputSchema: z.object({
    path: z
      .string()
      .optional()
      .describe("Project root to analyze (default: server working directory)"),
  }),
  async execute(input) {
    const relPath = input.path || ".";
    const projectDir = resolveSafePath(relPath);

    const result: AnalyzeProjectResult = {
      language: [],
      framework: [],
      architecture: [],
      containerized: false,
      multi_container: false,
      files_count: 0,
    };

    const rootEntries = await fs.readdir(projectDir, { withFileTypes: true });
    const rootNames = new Set(rootEntries.map((entry) => entry.name));

    const csprojFiles = glob.sync("**/*.csproj", {
      cwd: projectDir,
      ignore: ["node_modules/**", "dist/**", ".git/**"],
      nodir: true,
    });

    const slnFiles = glob.sync("**/*.sln", {
      cwd: projectDir,
      ignore: ["node_modules/**", "dist/**", ".git/**"],
      nodir: true,
    });

    const allFiles = glob.sync("**/*", {
      cwd: projectDir,
      ignore: ["node_modules/**", "dist/**", ".git/**"],
      nodir: true,
    });

    result.files_count = allFiles.length;

    if (csprojFiles.length > 0 || slnFiles.length > 0) {
      result.language.push("C#/.NET");
    }

    if (rootNames.has("go.mod")) {
      result.language.push("Go");
    }

    if (rootNames.has("requirements.txt") || rootNames.has("pyproject.toml")) {
      result.language.push("Python");
    }

    await detectFromPackageJson(projectDir, result);

    if (rootNames.has("angular.json")) {
      result.framework.push("Angular");
    }

    const hasNextConfig =
      glob.sync("next.config.*", {
        cwd: projectDir,
        nodir: true,
      }).length > 0;
    if (hasNextConfig) {
      result.framework.push("Next.js");
    }

    const hasViteConfig =
      glob.sync("vite.config.*", {
        cwd: projectDir,
        nodir: true,
      }).length > 0;
    if (hasViteConfig) {
      result.framework.push("Vite");
    }

    if (rootNames.has("Program.cs") && csprojFiles.length > 0) {
      result.framework.push("ASP.NET Core");
    }

    result.containerized = rootNames.has("Dockerfile");
    result.multi_container =
      rootNames.has("docker-compose.yml") ||
      rootNames.has("docker-compose.yaml");

    if (
      rootNames.has("src") &&
      (rootNames.has("tests") || rootNames.has("test"))
    ) {
      result.architecture.push("standard src/test layout");
    }

    if (slnFiles.length > 0 && csprojFiles.length > 1) {
      result.architecture.push("multi-project solution");
    }

    const text = JSON.stringify(result, null, 2);
    return { content: [{ type: "text", text }] };
  },
};
