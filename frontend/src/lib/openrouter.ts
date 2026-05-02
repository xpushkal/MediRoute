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

export async function callOpenRouter(messages: { role: string; content: string }[]) {
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

export async function streamOpenRouter(messages: { role: string; content: string }[]) {
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
