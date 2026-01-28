export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { action, payload } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    const baseUrl = process.env.GEMINI_BASE_URL || process.env.VITE_GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com';

    // Allow overriding models via env vars, formatted for backend
    const textModel = process.env.GEMINI_MODEL || process.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash';
    const imageModel = process.env.IMAGE_MODEL || process.env.VITE_IMAGE_MODEL || 'dall-e-3';

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Server configuration error: Missing API Key' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // --- Action: Generate Profile (Text) ---
    if (action === 'profile') {
      const { song, color, personality, userName } = payload;
      const isGemini = textModel.toLowerCase().includes('gemini');
      let url, headers, body;

      const systemPrompt = `你是一位《JOJO的奇妙冒险》替身设计专家。请根据以下用户特征，为一个新人类设计一个独特的替身(Stand)。\n请返回一个合法的 JSON 对象。`;
      const userPrompt = `
        用户特征:
        1. 替身使者: "${userName || 'Unknown'}"
        2. 音乐引用 (决定命名): "${song}"
        3. 代表色 (决定视觉): "${color}"
        4. 精神特质/欲望 (决定能力核心): "${personality}"

        请返回 JSON，包含以下字段:
        {
          "name": "替身名 (基于音乐引用)",
          "abilityName": "能力名",
          "ability": "能力详细描述 (基于'${personality}')",
          "stats": { "power": "A-E", "speed": "A-E", "range": "A-E", "durability": "A-E", "precision": "A-E", "potential": "A-E" },
          "appearance": "基于'${color}'色调的详细外貌描述",
          "shout": "替身吼叫"
        }
      `;

      if (isGemini) {
        // Strategy A: Google Gemini
        url = `${baseUrl}/v1beta/models/${textModel}:generateContent?key=${apiKey}`;
        headers = { 'Content-Type': 'application/json' };
        body = {
          contents: [{ parts: [{ text: systemPrompt + "\n" + userPrompt }] }]
        };
      } else {
        // Strategy B: OpenAI Compatible
        url = `${baseUrl}/v1/chat/completions`;
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        };
        body = {
          model: textModel,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          response_format: { type: "json_object" } // Enforce JSON for smart models
        };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
      });

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // --- Action: Generate Image ---
    if (action === 'image') {
      const { appearance } = payload;
      const isGemini = imageModel.toLowerCase().includes('gemini');
      let url, body, headers;

      const prompt = `(Masterpiece, Best Quality), Jojo's Bizarre Adventure Stand, art by Araki Hirohiko. ${appearance}. \n\nStyle tags: Anime, Manga Cover Art, Bold Black Lines, Heavy Hatching, Dramatic Shading, Hyper-muscular, Surreal Fashion, Dynamic 'JoJo Pose', Menacing Atmosphere (Gogogo), Vibrant and High Contrast Colors, Psychedelic Background. No humans, focus on the Stand entity.`;

      if (isGemini) {
        url = `${baseUrl}/v1beta/models/${imageModel}:generateContent?key=${apiKey}`;
        headers = { 'Content-Type': 'application/json' };
        body = {
          contents: [{
            role: "user",
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"]
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
          ]
        };
      } else {
        url = `${baseUrl}/v1/images/generations`;
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        };
        body = {
          model: imageModel,
          prompt: prompt,
          n: 1,
          size: "1024x1024"
        };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
      });

      // We return the raw provider response to the frontend, 
      // letting the frontend logic (which is already capable) handle the parsing details.
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
