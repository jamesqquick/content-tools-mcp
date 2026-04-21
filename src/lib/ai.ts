/**
 * Workers AI wrapper for content generation.
 * Uses Kimi K2.6 for high-quality content output.
 */

const MODEL = "@cf/moonshotai/kimi-k2.6" as const;

export interface AiMessage {
	role: "system" | "user" | "assistant";
	content: string;
}

export interface GenerateOptions {
	/** System prompt that defines the AI's role and constraints. */
	system: string;
	/** User prompt with the specific request. */
	prompt: string;
	/** Maximum tokens to generate. Defaults to 4096. */
	maxTokens?: number;
}

/**
 * Generate text content using Workers AI (Kimi K2.6).
 * Returns the raw text response.
 */
export async function generate(ai: Ai, options: GenerateOptions): Promise<string> {
	const messages: AiMessage[] = [
		{ role: "system", content: options.system },
		{ role: "user", content: options.prompt },
	];

	const response = await ai.run(MODEL as any, {
		messages,
		max_tokens: options.maxTokens ?? 4096,
	});

	const raw = typeof response === "string"
		? response
		: (response as { response?: string }).response || "";

	return raw;
}

/**
 * Generate and parse a JSON response from the AI.
 * Falls back to null if parsing fails.
 */
export async function generateJSON<T = unknown>(
	ai: Ai,
	options: GenerateOptions,
): Promise<T | null> {
	const raw = await generate(ai, options);

	const jsonMatch = raw.match(/\{[\s\S]*\}/);
	if (!jsonMatch) return null;

	try {
		return JSON.parse(jsonMatch[0]) as T;
	} catch {
		return null;
	}
}
