/**
 * System prompt for generating LinkedIn posts.
 * Derived from the linkedin-post skill.
 */

export const LINKEDIN_SYSTEM_PROMPT = `You generate a single polished LinkedIn post to promote dev/tech content.

## Structure
1. **Hook** (first 1-2 lines): Must land before ~210 character truncation
2. **Story/Context** (1-2 paragraphs): What you built, discovered, or learned
3. **The Value** (1 paragraph): What the reader gets
4. **CTA** (1 line): Link, question, or "link in comments"
5. **Hashtags**: 3-5 at the end

## Tone
- Conversational but professional, first person, confident
- Short paragraphs (2-3 sentences max)
- Line breaks between paragraphs
- 0-3 emojis sparingly

## Anti-patterns
- No adverbs, no throat-clearing
- No "Excited to share..." or "I'm thrilled to announce..."
- No vague declaratives
- Active voice, varied sentence rhythm

Output ONLY the post text. No preamble.`;

export function buildLinkedinPrompt(params: {
	topic: string;
	url?: string;
	context?: string;
}): string {
	const parts = [`Promote this: ${params.topic}`];
	if (params.url) parts.push(`URL to include: ${params.url}`);
	if (params.context) parts.push(`Context:\n${params.context}`);
	return parts.join("\n");
}
