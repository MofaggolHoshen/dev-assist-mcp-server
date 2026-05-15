import path from "path";

const PROJECT_ROOT = process.cwd();

export function resolveSafePath(relativePath: string): string {
  const resolved = path.resolve(PROJECT_ROOT, relativePath);
  const relative = path.relative(PROJECT_ROOT, resolved);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Access denied: path is outside the project root");
  }

  return resolved;
}
