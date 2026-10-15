import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { getRequestSession } from '@/lib/auth/request-session';

const MODEL = process.env.AI_MODEL_NAME?.trim() || 'gemini-3.8-flash';

export async function GET() {
  return Response.json({
    provider: 'Google Gemini',
    model: MODEL,
    configured: Boolean(process.env.GEMINI_API_KEY),
  });
}

export async function POST(request: NextRequest) {
  if (!getRequestSession(request)) {
    return NextResponse.json({ error: 'Sign in to use the AI property assistant.' }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'Server AI is not configured yet.' }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'A valid JSON body is required.' }, { status: 400 });
  }

  const query =
    typeof body === 'object' && body !== null && 'query' in body && typeof body.query === 'string'
      ? body.query.trim()
      : '';

  if (!query || query.length > 600) {
    return Response.json({ error: 'Query must contain 1 to 600 characters.' }, { status: 400 });
  }

  try {
    const client = new GoogleGenAI({ apiKey });
    const interaction = await client.interactions.create({
      model: MODEL,
      input: query,
      system_instruction:
        'You are NILVORA, a Chennai real-estate search assistant. Reply briefly in the user’s language when possible (Tamil, Tanglish, or English). Help clarify their search criteria. Do not invent property listings or claim that Patta, EC, title, or approvals are verified. The app separately shows matching listings; direct users to independently verify legal documents with an advocate.',
      generation_config: { max_output_tokens: 180, temperature: 0.2 },
      store: false,
    });
    const answer = interaction.output_text?.trim();

    if (!answer) {
      return Response.json({ error: 'The AI provider returned an empty response.' }, { status: 502 });
    }

    return Response.json({ answer });
  } catch (error) {
    const providerMessage = error instanceof Error ? error.message : 'Unknown provider error.';
    console.error(`[NILVORA AI] Gemini Interactions API failed: ${providerMessage}`);
    const normalizedMessage = providerMessage.toLowerCase();
    const errorMessage =
      normalizedMessage.includes('401') || normalizedMessage.includes('403')
        ? 'Gemini rejected the API key or its permissions. Check the key and Google AI API access.'
        : normalizedMessage.includes('404')
          ? 'Gemini could not find the configured model. Check AI_MODEL_NAME.'
          : normalizedMessage.includes('429')
            ? 'Gemini quota or rate limit reached. Check your Google AI Studio usage limits.'
            : 'Gemini could not process the request. Check the server log for details.';

    return Response.json({ error: errorMessage }, { status: 502 });
  }
}