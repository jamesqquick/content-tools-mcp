import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { generate, generateJSON } from "./lib/ai";
import { OUTLINE_SYSTEM_PROMPT, buildOutlinePrompt } from "./lib/prompts/outline";
import { SCRIPT_SYSTEM_PROMPT, buildScriptPrompt } from "./lib/prompts/script";
import { AUDIT_SYSTEM_PROMPT, buildAuditPrompt } from "./lib/prompts/audit";
import { TITLES_SYSTEM_PROMPT, buildTitlesPrompt } from "./lib/prompts/titles";
import { TWEET_SYSTEM_PROMPT, buildTweetPrompt } from "./lib/prompts/tweet";
import { LINKEDIN_SYSTEM_PROMPT, buildLinkedinPrompt } from "./lib/prompts/linkedin";

function mcpText(text: string) {
	return { content: [{ type: "text" as const, text }] };
}

function mcpError(message: string) {
	return { content: [{ type: "text" as const, text: `Error: ${message}` }], isError: true };
}

export class ContentToolsMCP extends McpAgent<Env> {
	server = new McpServer({
		name: "content-tools",
		version: "0.1.0",
	});

	async init() {
		// ── generate_outline ─────────────────────────────────────────
		this.server.tool(
			"generate_outline",
			"Generate a structured content outline (Value Pillars) from a topic. Returns pillar names, core points, mini-hooks, and a hook angle. Works for YouTube videos, blog posts, or any structured content.",
			{
				topic: z.string().describe("The topic or idea to create an outline for"),
				direction: z.string().optional().describe("Angle: tutorial, opinion, comparison, walkthrough, explainer"),
				audience: z.string().optional().describe("Target audience: beginner, intermediate, advanced"),
				target_length: z.string().optional().describe("Target length: short (under 60s), standard (5-10 min), long-form (15-30 min)"),
				notes: z.string().optional().describe("Additional context, notes, or raw ideas to incorporate"),
			},
			async ({ topic, direction, audience, target_length, notes }) => {
				try {
					const result = await generate(this.env.AI, {
						system: OUTLINE_SYSTEM_PROMPT,
						prompt: buildOutlinePrompt({ topic, direction, audience, targetLength: target_length, notes }),
						maxTokens: 2048,
					});
					return mcpText(result);
				} catch (e) {
					return mcpError(`Outline generation failed: ${(e as Error).message}`);
				}
			},
		);

		// ── generate_script ──────────────────────────────────────────
		this.server.tool(
			"generate_script",
			"Generate a full video script from an outline. Uses VISUAL/SCRIPT format with pattern interrupts and personality beats. Targets dev/coding tutorial content.",
			{
				outline: z.string().describe("The outline or Value Pillars to write a script from (can be JSON or plain text)"),
				title: z.string().optional().describe("Working title for the video"),
				target_length: z.string().optional().describe("Target length: short, standard (default), long-form"),
				notes: z.string().optional().describe("Additional context or instructions"),
			},
			async ({ outline, title, target_length, notes }) => {
				try {
					const result = await generate(this.env.AI, {
						system: SCRIPT_SYSTEM_PROMPT,
						prompt: buildScriptPrompt({ outline, title, targetLength: target_length, notes }),
						maxTokens: 8192,
					});
					return mcpText(result);
				} catch (e) {
					return mcpError(`Script generation failed: ${(e as Error).message}`);
				}
			},
		);

		// ── audit_script ─────────────────────────────────────────────
		this.server.tool(
			"audit_script",
			"Audit a video script or transcript for retention. Scores hook, pacing, personality, and outro on a 10-point scale. Returns specific red-pen edits and identifies the strongest moment (golden nugget).",
			{
				script: z.string().describe("The script or transcript to audit"),
				title: z.string().optional().describe("Video title (used for hook-to-title alignment check)"),
			},
			async ({ script, title }) => {
				try {
					const result = await generate(this.env.AI, {
						system: AUDIT_SYSTEM_PROMPT,
						prompt: buildAuditPrompt({ script, title }),
						maxTokens: 4096,
					});
					return mcpText(result);
				} catch (e) {
					return mcpError(`Audit failed: ${(e as Error).message}`);
				}
			},
		);

		// ── generate_titles ──────────────────────────────────────────
		this.server.tool(
			"generate_titles",
			"Generate 10 YouTube title options from a script, transcript, or topic description. Uses 20 proven templates across 4 psychological trigger categories. Includes top-3 analysis.",
			{
				script_or_topic: z.string().describe("Script, transcript, or topic description to generate titles from"),
			},
			async ({ script_or_topic }) => {
				try {
					const result = await generate(this.env.AI, {
						system: TITLES_SYSTEM_PROMPT,
						prompt: buildTitlesPrompt({ scriptOrTopic: script_or_topic }),
						maxTokens: 4096,
					});
					return mcpText(result);
				} catch (e) {
					return mcpError(`Title generation failed: ${(e as Error).message}`);
				}
			},
		);

		// ── generate_tweet ───────────────────────────────────────────
		this.server.tool(
			"generate_tweet",
			"Generate a single polished tweet to promote dev/tech content. Under 280 characters, conversational, technically accurate. Leads with the most interesting thing.",
			{
				topic: z.string().describe("The topic or content to promote"),
				url: z.string().optional().describe("URL that will be appended to the tweet (not included in the tweet text)"),
				context: z.string().optional().describe("Additional context about the content"),
			},
			async ({ topic, url, context }) => {
				try {
					const result = await generate(this.env.AI, {
						system: TWEET_SYSTEM_PROMPT,
						prompt: buildTweetPrompt({ topic, url, context }),
						maxTokens: 512,
					});
					return mcpText(result.trim());
				} catch (e) {
					return mcpError(`Tweet generation failed: ${(e as Error).message}`);
				}
			},
		);

		// ── generate_linkedin ────────────────────────────────────────
		this.server.tool(
			"generate_linkedin",
			"Generate a LinkedIn post to promote dev/tech content. Structured with hook, story, value, and CTA. Professional but conversational tone.",
			{
				topic: z.string().describe("The topic or content to promote"),
				url: z.string().optional().describe("URL to include in the post"),
				context: z.string().optional().describe("Additional context about the content"),
			},
			async ({ topic, url, context }) => {
				try {
					const result = await generate(this.env.AI, {
						system: LINKEDIN_SYSTEM_PROMPT,
						prompt: buildLinkedinPrompt({ topic, url, context }),
						maxTokens: 2048,
					});
					return mcpText(result.trim());
				} catch (e) {
					return mcpError(`LinkedIn post generation failed: ${(e as Error).message}`);
				}
			},
		);
	}
}
