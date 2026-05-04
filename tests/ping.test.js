import { pingTool } from "../src/tools/ping";
describe("pingTool", () => {
    it("should return pong", async () => {
        const result = await pingTool.execute({});
        expect(result).toEqual({ content: [{ type: "text", text: "pong" }] });
    });
});
