import { z } from "zod";
import { Tool } from "./types.js";

export const pingTool: Tool = {
  name: "ping",
  description: "Returns pong — used to verify the server is working",
  inputSchema: z.object({}),
  execute: async () => ({ content: [{ type: "text", text: "pong" }] }),
};
