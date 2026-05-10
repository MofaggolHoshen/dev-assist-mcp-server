import { getTemplateTool } from "../src/tools/knowledge/getTemplate";

describe("getTemplateTool", () => {
  it("returns template markdown for a known template", async () => {
    const result = await getTemplateTool.execute({
      template: "clean-architecture",
    });
    expect(result.content[0].text).toContain(
      "Clean Architecture Starter Template",
    );
    expect(result.content[0].text).toContain("Suggested Structure");
  });
});
