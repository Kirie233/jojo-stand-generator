export const config = {
  maxDuration: 60,
};

const normalizeBaseUrl = (url) => url.replace(/\/+$/, '');
const joinUrl = (baseUrl, path) => `${normalizeBaseUrl(baseUrl)}${path.startsWith('/') ? path : `/${path}`}`;
const shouldUseGeminiNative = (modelId, baseUrl) => {
  const requestedFormat = (process.env.TEXT_API_FORMAT || process.env.GEMINI_API_FORMAT || '').toLowerCase();
  if (requestedFormat === 'openai') return false;
  if (/api\.bltcy\.ai/i.test(baseUrl)) return false;
  return modelId.toLowerCase().includes('gemini');
};

const jsonResponse = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const streamJsonResponse = (task) => {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  (async () => {
    try {
      const data = await task();
      await writer.write(encoder.encode(JSON.stringify(data)));
      await writer.close();
    } catch (err) {
      console.error('[Gemini Stream] Error:', err);
      try {
        await writer.write(encoder.encode(JSON.stringify({ error: err.message || String(err) })));
        await writer.close();
      } catch {
        // writer may already be closed
      }
    }
  })();

  return new Response(readable, {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

const readJsonOrText = async (response) => {
  const rawText = await response.text();
  if (!rawText) return {};

  try {
    return JSON.parse(rawText);
  } catch {
    return { error: rawText };
  }
};

export default async function handler(req) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,OPTIONS,POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  // Get Key from Server Environment
  const apiKey = process.env.TEXT_SECRET_KEY || process.env.TEXT_API_KEY || process.env.GEMINI_SECRET_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return jsonResponse({ error: 'Server Error: API Key not configured' }, 500);
  }

  try {
    const body = await req.json();
    const { prompt, model } = body || {};

    if (!prompt) {
      return jsonResponse({ error: 'Missing prompt in request body' }, 400);
    }

    const modelId = model || process.env.TEXT_MODEL || process.env.GEMINI_MODEL || 'gemini-3-flash-preview';
    const baseUrl = process.env.TEXT_BASE_URL || process.env.GEMINI_BASE_URL || 'https://api.bltcy.ai/';
    const useGeminiNative = shouldUseGeminiNative(modelId, baseUrl);
    const url = useGeminiNative
      ? joinUrl(baseUrl, `/v1beta/models/${modelId}:generateContent`)
      : joinUrl(baseUrl, '/v1/chat/completions');

    return streamJsonResponse(async () => {
      // Call API (Server-to-Server)
      const googleResponse = await fetch(url, {
        method: 'POST',
        headers: useGeminiNative
          ? {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey,
            }
          : {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
        body: JSON.stringify(useGeminiNative
          ? { contents: [{ parts: [{ text: prompt }] }] }
          : {
              model: modelId,
              messages: [{ role: 'user', content: prompt }],
              response_format: { type: 'json_object' },
            }),
      });

      const data = await readJsonOrText(googleResponse);

      if (!googleResponse.ok) {
        console.error('[Gemini] API Error:', googleResponse.status, JSON.stringify(data));
        return { error: data.error || `Text generation failed with status ${googleResponse.status}`, raw: data };
      }

      return data;
    });

  } catch (error) {
    console.error("Edge Proxy Error:", error);
    return jsonResponse({ error: error.message }, 500);
  }
}
