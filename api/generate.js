export const config = {
  runtime: 'edge',
};

const normalizeBaseUrl = (url) => url.replace(/\/+$/, '');
const joinUrl = (baseUrl, path) => `${normalizeBaseUrl(baseUrl)}${path.startsWith('/') ? path : `/${path}`}`;

const buildProfileSystemPrompt = () => {
  return '你是 JOJO 风格替身档案撰写器。使用简洁、清晰、偏百科的中文口吻，返回合法 JSON。';
};

const buildProfileUserPrompt = ({ song, color, personality, userName, premadeConcept, referenceImage }) => {
  return `
请基于以下信息生成一个 JOJO 风格替身档案：

[输入信息]
- 替身使者：${userName || 'Unknown'}
- 命名来源：${song}
- 主色调：${color}
- 性格/执念：${personality}
${premadeConcept ? `- 已确认概念：替身名“${premadeConcept.name}”，外观“${premadeConcept.appearance}”。请在此基础上完善。` : ''}
${referenceImage ? '- 用户上传了参考图，请把能识别出的轮廓、气质或局部特征融入外观描述。' : ''}

输出要求：
1. 所有字段都用中文输出。
2. 文案要有规则感和画面感，但不要写成散文或长篇故事。
3. desc 控制在 28 到 45 个字，说明核心能力的本质和效果。
4. long_desc 控制在 120 到 180 个字，包含外观、能力作用机制、主要效果、战斗中的使用方式和危险气质。
5. mechanics 固定保留 4 条，每条 content 控制在 65 到 100 个字。四条标题必须分别是：核心能力、作用机制、战术应用、特殊运用。
6. 每条 mechanics 只写正向能力描述、运作规则和使用方式。
7. limitations 固定返回空数组 []。
8. 能力设计要像 JOJO 替身：规则明确、画面鲜明、可以被聪明利用，不要只是“操控元素/提升力量/瞬间秒杀”。
9. appearance 使用简洁中文，控制在 45 到 80 个字，便于档案展示。
10. stats 必须有取舍，不要全 A。每项只能使用 A、B、C、D、E、?、∞、None。? 表示能力机制导致无法测定；∞ 表示规则层面没有上限或可无限成长/延伸；None 表示该维度不适用。特殊值最多使用 2 项，不要滥用。近距离人形/力量型替身的 range 通常为 C 或 D；普通人形替身 range 不要给 A。只有远隔、自动追踪、群体、现象、领域或绑定型替身才可以给 range A 或 ∞。
11. 不要输出 Markdown，不要加解释。

返回 JSON 结构：
{
  "name": "替身名",
  "type": "替身类型",
  "panel": {
    "abilityName": "能力名",
    "desc": "一句话能力摘要，点明核心规则",
    "long_desc": "较完整的外观、触发方式、效果和危险气质说明",
    "mechanics": [
      {
        "title": "核心能力：xx",
        "content": "写清替身最根本的能力规则、影响对象和直接效果"
      },
      {
        "title": "作用机制：xx",
        "content": "写清能力如何展开、依靠什么媒介或状态运作，以及效果如何持续"
      },
      {
        "title": "战术应用：xx",
        "content": "写清战斗中如何用于控制、突袭、追踪、牵制、防御或改变局面"
      },
      {
        "title": "特殊运用：xx",
        "content": "写清更有 JOJO 感的高阶用法，例如连锁效果、心理压迫、环境利用或伪装"
      }
    ],
    "limitations": [],
    "battleCry": "短战吼",
    "quote": "短台词"
  },
  "stats": {
    "power": "A/B/C/D/E/?/∞/None",
    "speed": "A/B/C/D/E/?/∞/None",
    "range": "A/B/C/D/E/?/∞/None",
    "durability": "A/B/C/D/E/?/∞/None",
    "precision": "A/B/C/D/E/?/∞/None",
    "potential": "A/B/C/D/E/?/∞/None"
  },
  "appearance": "简洁中文外观描述"
}`;
};

const buildEyecatchPrompt = ({
  standName,
  userName,
  song,
  color,
  personality,
  referenceImage,
  visualConcept
}) => {
  const resolvedSong = song || 'an unspecified musical reference';
  const resolvedColor = color || 'bold contrasting palette';
  const resolvedPersonality = personality || 'mysterious psychic tension';
  const resolvedUserName = userName || 'Unknown User';
  const resolvedStandName = standName || 'Unknown Stand';
  const conceptLines = visualConcept ? [
    'Confirmed visual concept from the first design pass:',
    visualConcept.formType ? `- Form type: ${visualConcept.formType}` : null,
    visualConcept.appearance ? `- Appearance: ${visualConcept.appearance}` : null,
    visualConcept.reasoning ? `- Design reason: ${visualConcept.reasoning}` : null,
    'Use this confirmed concept as the main Stand design. Do not replace it with an unrelated character.'
  ].filter(Boolean).join('\n') : null;

  return [
    'An authentic Japanese TV anime Stand eyecatch screenshot, bizarre and stylish action manga aesthetic, classic cel-shading, 16:9 landscape.',
    `User form inputs: Stand user "${resolvedUserName}", Stand name "${resolvedStandName}", music reference "${resolvedSong}", color direction "${resolvedColor}", personality or obsession "${resolvedPersonality}", reference photo: ${referenceImage ? 'yes' : 'no'}. Use these inputs as design DNA, not as visible text.`,
    conceptLines,
    `Background: a flat graphic anime eyecatch backdrop built from ${resolvedColor}, checkerboards, radial bursts, floral or geometric patterns, manga speed lines, halftone dots, and motifs inspired by the music reference and personality.`,
    'Character (one side): design an original psychic guardian Stand directly from the inputs. It may be humanoid, colony-like, wearable, object-bound, creature-like, phenomenon-like, or vehicle/building-bound. Give it a clear silhouette, one or two memorable motifs, a dramatic cropped pose, varied line weight, hard-edge anime shadows, glossy highlights, and a unique color palette.',
    'Layout: place the Stand on one side or diagonally across one side, occupying about 40% to 55% of the frame. Keep the opposite side flatter and cleaner for app overlays.',
    'Overlay-safe zones: leave a clear circular area on the opposite side for a radar chart, plus readable corners for NAME and MASTER text that the app will add later.',
    'Do not draw any text, letters, numbers, subtitles, logos, watermarks, captions, speech bubbles, radar charts, stat wheels, UI borders, buttons, or interface elements. Avoid photorealism, generic fantasy armor, centered portraits, full-body character sheets, vertical compositions, and cluttered item piles.',
    'Vibe: retro TV broadcast quality, high contrast, visually striking composition.'
  ].join('\n\n');
};

const jsonResponse = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const toImageDataUrl = (value, mimeType = 'image/png') => {
  if (!value) return null;
  if (/^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(value)) {
    return value;
  }
  return `data:${mimeType};base64,${value}`;
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const {
      action,
      payload,
      textModel: requestedTextModel,
      imageModel: requestedImageModel
    } = await req.json();
    const apiKey = process.env.TEXT_API_KEY || process.env.GEMINI_API_KEY;
    const baseUrl = process.env.TEXT_BASE_URL || process.env.GEMINI_BASE_URL || 'https://api.bltcy.ai/';
    const textModel = requestedTextModel || process.env.TEXT_MODEL || process.env.GEMINI_MODEL || 'gemini-3-flash-preview';
    const imageModel = requestedImageModel || process.env.IMAGE_MODEL || 'gpt-image-2';

    if (!apiKey) {
      return jsonResponse({ error: 'Server configuration error: Missing API Key' }, 500);
    }

    if (action === 'profile') {
      const { song, color, personality, userName, premadeConcept, referenceImage } = payload;
      const isGemini = textModel.toLowerCase().includes('gemini');
      const systemPrompt = buildProfileSystemPrompt();
      const userPrompt = buildProfileUserPrompt({
        song,
        color,
        personality,
        userName,
        premadeConcept,
        referenceImage
      });

      let url;
      let headers;
      let body;

      if (isGemini) {
        url = `${joinUrl(baseUrl, `/v1beta/models/${textModel}:generateContent`)}?key=${apiKey}`;
        headers = { 'Content-Type': 'application/json' };

        const parts = [{ text: userPrompt }];
        if (referenceImage) {
          const base64Data = referenceImage.split(',')[1];
          const mimeType = referenceImage.split(';')[0].split(':')[1];
          parts.push({
            inlineData: {
              mimeType,
              data: base64Data
            }
          });
        }

        body = { contents: [{ parts }] };
      } else {
        url = joinUrl(baseUrl, '/v1/chat/completions');
        headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        };

        const userContent = [{ type: 'text', text: userPrompt }];
        if (referenceImage) {
          userContent.push({
            type: 'image_url',
            image_url: { url: referenceImage }
          });
        }

        body = {
          model: textModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent }
          ],
          response_format: { type: 'json_object' }
        };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      const data = await response.json();
      return jsonResponse(data, response.status);
    }

    if (action === 'image') {
      const { standName, userName, song, color, personality, referenceImage, visualConcept } = payload;
      const isGemini = imageModel.toLowerCase().includes('gemini');
      const isGptImage = imageModel.toLowerCase().includes('gpt-image');
      const imgApiKey = process.env.IMAGE_API_KEY || apiKey;
      const imgBaseUrl = process.env.IMAGE_BASE_URL || 'https://api.bltcy.ai/';
      const imageSize = '1536x1024';
      const imageQuality = 'medium';
      const prompt = buildEyecatchPrompt({
        standName,
        userName,
        song,
        color,
        personality,
        referenceImage,
        visualConcept
      });

      let url;
      let headers;
      let body;

      if (isGemini) {
        url = joinUrl(imgBaseUrl, `/v1beta/models/${imageModel}:generateContent`);
        headers = {
          'Content-Type': 'application/json',
          'x-goog-api-key': imgApiKey
        };
        body = {
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
          ]
        };
      } else {
        url = joinUrl(imgBaseUrl, '/v1/images/generations');
        headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${imgApiKey}`
        };
        body = {
          model: imageModel,
          prompt,
          n: 1,
          size: imageSize
        };
        if (isGptImage) {
          body.quality = imageQuality;
          body.size = imageSize;
        }
      }

      console.log('[Image] Provider:', imgBaseUrl, '| Model:', imageModel, '| isGemini:', isGemini);

      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();

      (async () => {
        try {
          let response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
          });

          let rawText = await response.text();

          const data = rawText ? JSON.parse(rawText) : {};

          if (!response.ok) {
            console.error('[Image] API Error:', response.status, JSON.stringify(data));
            await writer.write(
              new TextEncoder().encode(JSON.stringify({ error: data.error || 'Image generation failed', raw: data }))
            );
            await writer.close();
            return;
          }

          let imageData = null;

          if (isGemini) {
            const parts = data.candidates?.[0]?.content?.parts || [];
            const imagePart = parts.find((part) => part.inline_data?.data || part.inlineData?.data);
            if (imagePart) {
              const dataObj = imagePart.inline_data || imagePart.inlineData;
              const mimeType = dataObj.mime_type || dataObj.mimeType || 'image/png';
              imageData = toImageDataUrl(dataObj.data, mimeType);
            }
          } else {
            const item = data.data?.[0];
            imageData = item?.b64_json ? toImageDataUrl(item.b64_json, 'image/png') : item?.url || null;
          }

          await writer.write(new TextEncoder().encode(JSON.stringify({ imageData })));
          await writer.close();
        } catch (err) {
          console.error('[Image] Stream error:', err);
          try {
            await writer.write(new TextEncoder().encode(JSON.stringify({ error: err.message })));
            await writer.close();
          } catch {
            // writer may already be closed
          }
        }
      })();

      return new Response(readable, {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return jsonResponse({ error: 'Invalid action' }, 400);
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}
