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
    const textModel = process.env.GEMINI_MODEL || process.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash';
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

      const systemPrompt = `你是一位严谨的《JOJO的奇妙冒险》替身数据录入员，正在为“JOJO百科 (JoJo Wiki)”撰写词条。
      你的任务是基于用户提供的关键词，生成一份**专业、客观且详实**的替身档案。
      
      核心写作风格严格参照【白金之星】的百科词条：
      1. **百科全书口吻**：使用第三人称。语气客观、冷静，避免过多的主观修饰。
      2. **精确的术语**：在描述属性时，使用标准的JOJO术语。
      3. **能力深度解析**：写出机制（例如：“能够随意控制热能的流动”）。
      4. **结构化描述**：将能力拆解为【基本能力】和【衍生应用】。`;

      const userPrompt = `
        请基于以下数据，生成一份标准的【JOJO百科替身词条】：

        用户特征:
        1. 替身使者 (User): "${userName || 'Unknown'}"
        2. 命名来源 (Name Origin): "${song}"
        3. 视觉色调 (Color): "${color}"
        4. 核心欲望 (Core Desire): "${personality}"

        请返回 JSON，包含以下字段:
        {
          "name": "替身名 (英文名 + 官方译名风格的中文名，如 'Star Platinum (白金之星)')",
          "type": "替身类型 (如：近距离力量型、远距离自动操纵型、群体型、现象型、器物/装备型、规则概念型、无意识暴走型、穿戴/一体化型、同化型(附着于物体)、陷阱/自动触发型、寄生型)",
          "panel": {
            "abilityName": "能力名 (四字熟语或简洁短语，如 '时间暂停'、'黄金体验')",
            "desc": "【能力摘要】一句话概括核心功能，类似百科的顶部简介。",
            "long_desc": "【替身简介】一段详实的百科式描述。包含替身的外观特征（基于色调）、出现方式以及能力的整体概述。请用说明文的口吻，描述其独特的压迫感或神圣感。",
            "mechanics": [
              {
                "title": "基本能力：[机制名称]",
                "content": "详细解释该能力的工作原理。（约80-100字）"
              },
              {
                "title": "衍生技：[技能名称]",
                "content": "基于基本能力的进阶应用。（约80-100字）"
              }
            ],
            "limitations": [
              "限制条件 1 (精确描述能力的边界)",
              "弱点/代价 2"
            ],
            "battleCry": "战吼 (如：欧拉欧拉 (ORA ORA)、木大木大 (MUDA MUDA))",
            "quote": "名台词 (一句展现替身使者觉悟或性格的经典发言)"
          },
          "stats": {
            "power": "A/B/C/D/E/?/∞",
            "speed": "A/B/C/D/E/?/∞",
            "range": "A/B/C/D/E/?/∞",
            "durability": "A/B/C/D/E/?/∞",
            "precision": "A/B/C/D/E/?/∞",
            "potential": "A/B/C/D/E/?/∞"
          },
          "appearance": "基于'${color}'色调的详细外貌描述，用于后续绘画。使用百科词条的笔触（如：该替身呈现为人型，全身覆盖着...，头部装饰有...）。"
        }
      `;

      if (isGemini) {
        // Strategy A: Google Gemini
        url = `${baseUrl}/v1beta/models/${textModel}:generateContent?key=${apiKey}`;
        headers = { 'Content-Type': 'application/json' };
        body = {
          contents: [{ parts: [{ text: systemPrompt + "\n" + userPrompt }] }],
          generationConfig: {
            response_mime_type: "application/json"
          }
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

      const prompt = `(Masterpiece, Best Quality), Jojo's Bizarre Adventure Stand, art by Araki Hirohiko. ${appearance}. \n\nStyle tags: Anime Character Sheet, Full Body Reference, White Background, Simple Background, Bold Black Lines, Heavy Hatching, Dramatic Shading, Hyper-muscular, Dynamic 'JoJo Pose', Vibrant Colors. No humans, focus on the Stand entity. \n\nNEGATIVE PROMPT: text, letters, watermark, signature, username, ui, interface, speech bubble, caption, logo.`;

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
