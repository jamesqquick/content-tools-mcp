import { ContentToolsMCP } from "./mcp";

export { ContentToolsMCP };

export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		if (url.pathname === "/mcp" || url.pathname.startsWith("/mcp/")) {
			return ContentToolsMCP.serveSSE("/mcp").fetch(request, env, ctx);
		}

		return new Response(
			JSON.stringify({
				name: "content-tools-mcp",
				description: "AI-powered content generation tools for creators. Generate video scripts, titles, thumbnails, tweets, blog posts, and more.",
				mcp_endpoint: "/mcp",
			}),
			{
				headers: { "Content-Type": "application/json" },
			},
		);
	},
} satisfies ExportedHandler<Env>;
