import { ToolRegistry } from "../src/tools/registry";
import { pingTool } from "../src/tools/ping";

describe("ToolRegistry", () => {
  it("registers and retrieves a tool", () => {
    const registry = new ToolRegistry();
    registry.register(pingTool);
    expect(registry.get("ping")).toBe(pingTool);
  });

  it("throws on duplicate registration", () => {
    const registry = new ToolRegistry();
    registry.register(pingTool);
    expect(() => registry.register(pingTool)).toThrow();
  });

  it("lists registered tools", () => {
    const registry = new ToolRegistry();
    registry.register(pingTool);
    expect(registry.list()).toContain(pingTool);
  });
});
