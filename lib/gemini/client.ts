const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY ?? "";
  if (!key) throw new Error("GEMINI_API_KEY is not set");
  return key;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
  error?: { message: string };
}

const AD_ANALYSIS_PROMPT = `You are analyzing an ENERGYbits (spirulina/chlorella supplements) advertisement.
Visit the URL provided and analyze the ad content. Return a concise analysis covering:
1. HOOK (first 3 seconds): What happens? Is it attention-grabbing?
2. MESSAGE: What is the main value proposition or claim?
3. CTA: Is there a clear call-to-action? What is it?
4. TONE: What tone and audience does it target?
5. WEAKNESSES: What is the single biggest creative weakness?

Keep the response under 200 words. Be specific — quote actual words or describe actual visuals when possible.`;

export async function analyzeAdUrl(adUrl: string): Promise<string> {
  const apiKey = getApiKey();

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          { text: `${AD_ANALYSIS_PROMPT}\n\nAd URL: ${adUrl}` }
        ]
      }
    ],
    tools: [{ urlContext: {} }],
    generationConfig: {
      maxOutputTokens: 512,
      temperature: 0.3
    }
  };

  const res = await fetch(`${BASE_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${err}`);
  }

  const data = (await res.json()) as GeminiResponse;

  if (data.error) throw new Error(`Gemini error: ${data.error.message}`);

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  if (!text) throw new Error("Gemini returned an empty response");
  return text.trim();
}
