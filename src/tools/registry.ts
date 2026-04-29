import {Tool} from "./types.js"

export class ToolRegistry{
    private tools = new Map<string, Tool>();

    register(tool: Tool): void{
        /* store in map, throw on duplicate */
    }

   list(): Tool[] {
    /* return Array.from(this.tools.values()) */
    return [];
  }
  get(name: string): Tool | undefined {
    /* return this.tools.get(name) */

    return;
  }
}