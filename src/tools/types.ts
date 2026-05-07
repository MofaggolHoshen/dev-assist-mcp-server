import { z } from "zod";

export interface Tool {
  name: string; // unique tool name, e.g. "list_files"
  description: string; // shown to AI clients so they know when to use it
  inputSchema: z.ZodTypeAny; // Zod schema defining accepted parameters
  execute(input: any): Promise<{ content: { type: "text"; text: string }[] }>; // function that performs the tool's action
}
