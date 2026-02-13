export const config = {
  runtime: 'edge',
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
  const apiKey = process.env.GEMINI_SECRET_KEY || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Server Error: API Key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { prompt, model } = body || {};

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Missing prompt in request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const modelId = model || process.env.GEMINI_MODEL || process.env.VITE_GEMINI_MODEL || 'gemini-3-flash-preview';
    const baseUrl = process.env.GEMINI_BASE_URL || process.env.VITE_GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com';
    const url = `${baseUrl}/v1beta/models/${modelId}:generateContent`;

    // Call API (Server-to-Server)
    const googleResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await googleResponse.json();

    return new Response(JSON.stringify(data), {
      status: googleResponse.status,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Edge Proxy Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
