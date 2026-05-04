import path from "path";

const PROJECT_ROOT = process.cwd();

export function resolveSafePath(relativePath: string): string {
  const resolved = path.resolve(PROJECT_ROOT, relativePath);
  if (!resolved.startsWith(PROJECT_ROOT)) {
    throw new Error("Access denied: path is outside the project root");
  }
  return resolved;
}
