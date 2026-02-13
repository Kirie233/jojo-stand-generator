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
    const textModel = process.env.GEMINI_MODEL || process.env.VITE_GEMINI_MODEL || 'gemini-3-flash-preview';
    const imageModel = process.env.IMAGE_MODEL || process.env.VITE_IMAGE_MODEL || 'gemini';

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

      const systemPrompt = `你是一位严谨的《JOJO的奇妙冒险》替身数据录入员，正在为"JOJO百科 (JoJo Wiki)"撰写词条。
你的任务是基于用户提供的关键词，生成一份**专业、客观且详实**的替身档案。

核心写作风格严格参照【白金之星】的百科词条：
1. **百科全书口吻**：使用第三人称。语气客观、冷静，避免过多的主观修饰。
2. **精确的术语**：在描述属性时，使用标准的JOJO术语。
3. **能力深度解析**：不要只写"控制火"，要写出**机制**。
4. **结构化描述**：将能力拆解为【基本能力】和【衍生应用】，条理清晰。
请返回一个合法的 JSON 对象。`;
      const userPrompt = `
请基于以下数据，生成一份标准的【JOJO百科替身词条】：

【档案元数据】
1. 替身使者 (User): "${userName || 'Unknown'}"
2. 命名来源 (Name Origin): "${song}" (由此决定替身名)
3. 视觉色调 (Color): "${color}"
4. 核心欲望 (Core Desire): "${personality}" (由此推导能力机制)

⚠️ 严格指令：
1. **能力强度随机化**：严禁将所有替身都设计得很强！允许生成弱替身。
2. **形态多样性**：不要局限于人型！
3. **色彩描述禁令**：绝对禁止在返回的文本中包含任何十六进制颜色代码或RGB代码。
4. **格式清洗**：返回的 JSON 字段值中绝对禁止包含如"【替身简介】"、"【基本能力】"等带方括号的指示性标题，直接输出内容即可。

请返回一个严格符合 JSON 格式的对象（不要使用 Markdown 代码块）：
{
  "name": "替身名 (英文名 + 中文名，如 'Star Platinum (白金之星)')",
  "type": "替身类型 (如：近距离力量型、远距离自动操纵型、群体型等)",
  "panel": {
    "abilityName": "能力名 (四字熟语或简洁短语，如 '时间暂停')",
    "desc": "一句话概括核心功能",
    "long_desc": "一段详实的百科式描述，包含替身的外观特征和能力概述",
    "mechanics": [
      {
        "title": "基本能力：[机制名称]",
        "content": "详细解释该能力的工作原理（约80-100字）"
      },
      {
        "title": "衍生技：[技能名称]",
        "content": "基于基本能力的进阶应用（约80-100字）"
      }
    ],
    "limitations": [
      "限制条件 1",
      "弱点/代价 2"
    ],
    "battleCry": "战吼 (如：ORA ORA、MUDA MUDA)",
    "quote": "名台词"
  },
  "stats": {
    "power": "评级 (A/B/C/D/E/None/∞)",
    "speed": "评级",
    "range": "评级",
    "durability": "评级",
    "precision": "评级",
    "potential": "成长性"
  },
  "appearance": "基于'${color}'色调的详细外貌描述，用于后续绘画"
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

      // Support independent Image Provider credentials
      const imgApiKey = process.env.IMAGE_API_KEY || apiKey;
      const imgBaseUrl = process.env.IMAGE_BASE_URL || baseUrl;

      let url, body, headers;

      const prompt = `Draw a JoJo's Bizarre Adventure Stand character in the art style of Hirohiko Araki. ${appearance}. The art style should feature bold ink outlines, dramatic cross-hatching shadows, vibrant saturated colors, and an exaggerated dynamic pose. Position the Stand on the right side of the image. Use a dramatic, atmospheric background that fits the Stand's theme. This is a Stand entity, not a human character. Do not include any text, letters, watermarks, or UI elements in the image.`;

      if (isGemini) {
        url = `${imgBaseUrl}/v1beta/models/${imageModel}:generateContent`;
        headers = {
          'Content-Type': 'application/json',
          'x-goog-api-key': imgApiKey
        };
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
        url = `${imgBaseUrl}/v1/images/generations`;
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${imgApiKey}`
        };
        body = {
          model: imageModel,
          prompt: prompt,
          n: 1,
          size: "1024x1024"
        };
      }

      console.log("[Image] Provider:", imgBaseUrl, "| Model:", imageModel, "| isGemini:", isGemini);

      // Use streaming to avoid Edge 25s timeout:
      // Start sending response immediately, write actual data when Gemini responds.
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();

      // Launch async processing in background (not awaited)
      (async () => {
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
          });

          const data = await response.json();

          if (!response.ok) {
            console.error("[Image] API Error:", response.status, JSON.stringify(data));
            await writer.write(new TextEncoder().encode(JSON.stringify({
              error: data.error || 'Image generation failed', raw: data
            })));
            await writer.close();
            return;
          }

          // Normalize response: extract image data regardless of provider format
          let imageData = null;

          if (isGemini) {
            const parts = data.candidates?.[0]?.content?.parts || [];
            console.log("[Image] Gemini parts count:", parts.length);
            const imagePart = parts.find(p => (p.inline_data?.data) || (p.inlineData?.data));
            if (imagePart) {
              const dataObj = imagePart.inline_data || imagePart.inlineData;
              const mimeType = dataObj.mime_type || dataObj.mimeType || 'image/png';
              console.log("[Image] Found Base64 image, mime:", mimeType, "| data length:", dataObj.data.length);
              imageData = `data:${mimeType};base64,${dataObj.data}`;
            } else {
              console.warn("[Image] No image found in parts.");
            }
          } else {
            imageData = data.data?.[0]?.url || null;
          }

          await writer.write(new TextEncoder().encode(JSON.stringify({ imageData })));
          await writer.close();
        } catch (err) {
          console.error("[Image] Stream error:", err);
          try {
            await writer.write(new TextEncoder().encode(JSON.stringify({ error: err.message })));
            await writer.close();
          } catch (_) { /* writer may already be closed */ }
        }
      })();

      // Return response immediately (starts the 300s streaming window)
      return new Response(readable, {
        status: 200,
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
