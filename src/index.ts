import { ContentToolsMCP } from "./mcp";

export { ContentToolsMCP };

// McpAgent.serve() handles Streamable HTTP transport with automatic SSE fallback
export default ContentToolsMCP.serve("/mcp", {
	binding: "CONTENT_TOOLS_MCP",
});
