import { explainConceptTool } from "../src/tools/knowledge/explainConcept";

describe("explainConceptTool", () => {
  it("returns explanation for a known concept", async () => {
    const result = await explainConceptTool.execute({
      concept: "circuit-breaker",
    });
    expect(result.content[0].text).toContain("Circuit Breaker Pattern");
    expect(result.content[0].text).toContain("When to Use");
  });
});
