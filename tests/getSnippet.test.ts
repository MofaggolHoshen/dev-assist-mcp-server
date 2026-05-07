import { getSnippetTool } from "../src/tools/knowledge/getSnippet";

describe("getSnippetTool", () => {
  it("returns snippet content for a known snippet", async () => {
    const result = await getSnippetTool.execute({ name: "polly-retry" });
    expect(result.content[0].text).toContain("Polly Retry Policy");
    expect(result.content[0].text).toContain("WaitAndRetryAsync");
  });

  it("returns available snippet names for unknown snippet", async () => {
    const result = await getSnippetTool.execute({ name: "does-not-exist" });
    expect(result.content[0].text).toContain("Available snippets");
    expect(result.content[0].text).toContain("polly-retry");
  });
});
