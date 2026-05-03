// OpenRouter AI Gateway client configuration

const FREE_MODELS = [
  "qwen/qwen3-coder:free",
  "openai/gpt-oss-120b:free",
  "z-ai/glm-4.5-air:free",
  "openrouter/free",
];

export const OPENROUTER_CONFIG = {
  baseUrl: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "",
};

// ── Rate Limiter (in-memory, per IP, with auto-cleanup) ─────────────────

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 15;       // max requests per window
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const MAX_ENTRIES = 10_000;      // cap to prevent memory exhaustion

function cleanRateLimitMap() {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetTime) rateLimitMap.delete(key);
  }
}

// Auto-cleanup every 5 minutes
setInterval(cleanRateLimitMap, 5 * 60_000);

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    // Evict oldest if at capacity
    if (rateLimitMap.size >= MAX_ENTRIES) cleanRateLimitMap();
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count };
}

// ── API Key Validation ──────────────────────────────────────────────────

export function validateApiKey(): void {
  if (!OPENROUTER_CONFIG.apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY is not set. Please add it to your .env file. " +
      "Get a free key from https://openrouter.ai"
    );
  }
}

// ── OpenRouter Call (non-streaming) ─────────────────────────────────────

export async function callOpenRouter(messages: { role: string; content: string }[]) {
  validateApiKey();
  let lastError: Error | null = null;

  for (const model of FREE_MODELS) {
    try {
      const res = await fetch(`${OPENROUTER_CONFIG.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_CONFIG.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://mediroute.ai",
          "X-Title": "MediRoute AI",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.3,
          max_tokens: 2048,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.warn(`Model ${model} failed (${res.status}), trying next...`);
        lastError = new Error(`OpenRouter error ${res.status}: ${err}`);
        continue;
      }

      const data = await res.json();

      // Validate response structure
      if (!data.choices?.[0]?.message?.content) {
        console.warn(`Model ${model} returned empty content, trying next...`);
        lastError = new Error(`Model ${model} returned no content`);
        continue;
      }

      console.log(`Using model: ${model}`);
      return data;
    } catch (e) {
      console.warn(`Model ${model} threw error, trying next...`);
      lastError = e as Error;
      continue;
    }
  }

  throw lastError || new Error("All models failed");
}

// ── OpenRouter Streaming ────────────────────────────────────────────────

export async function streamOpenRouter(messages: { role: string; content: string }[]) {
  validateApiKey();
  let lastError: Error | null = null;

  for (const model of FREE_MODELS) {
    try {
      const res = await fetch(`${OPENROUTER_CONFIG.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_CONFIG.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://mediroute.ai",
          "X-Title": "MediRoute AI",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.3,
          max_tokens: 2048,
          stream: true,
        }),
      });

      if (!res.ok) {
        console.warn(`Stream model ${model} failed (${res.status}), trying next...`);
        lastError = new Error(`OpenRouter error ${res.status}`);
        continue;
      }

      console.log(`Streaming with model: ${model}`);
      return res;
    } catch (e) {
      lastError = e as Error;
      continue;
    }
  }

  throw lastError || new Error("All models failed");
}
