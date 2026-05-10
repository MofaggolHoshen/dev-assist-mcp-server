import { generateSetupTool } from "../src/tools/knowledge/generateSetup";

describe("generateSetupTool", () => {
  it("returns framework-specific setup when available", async () => {
    const result = await generateSetupTool.execute({
      type: "jwt",
      framework: "dotnet9",
    });
    expect(result.content[0].text).toContain("JWT Setup for .NET 9");
  });

  it("falls back to generic setup when specific setup is not found", async () => {
    const result = await generateSetupTool.execute({
      type: "jwt",
      framework: "unknown-framework",
    });
    expect(result.content[0].text).toContain("JWT Setup Baseline");
  });
});
