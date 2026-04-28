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
4. long_desc 控制在 120 到 180 个字，包含外观、能力触发方式、主要效果、战斗中的使用方式和危险气质。
5. mechanics 保留 3 条，每条 content 控制在 70 到 110 个字。每条都要写清楚触发条件、作用对象、具体效果和一个战术用途。
6. limitations 固定返回空数组 []。
7. 能力设计要像 JOJO 替身：规则明确、画面鲜明、可以被聪明利用，不要只是“操控元素/提升力量/瞬间秒杀”。
8. appearance 使用简洁中文，控制在 45 到 80 个字，便于档案展示。
9. 不要输出 Markdown，不要加解释。

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
        "content": "写清触发条件、作用对象、具体效果和战术用途"
      },
      {
        "title": "衍生应用：xx",
        "content": "写清如何利用核心规则进行移动、防御、控制或欺骗"
      },
      {
        "title": "特殊运用：xx",
        "content": "写清能力在追踪、压制、移动、伪装或连锁效果中的独特用法"
      }
    ],
    "limitations": [],
    "battleCry": "短战吼",
    "quote": "短台词"
  },
  "stats": {
    "power": "A/B/C/D/E/None",
    "speed": "A/B/C/D/E/None",
    "range": "A/B/C/D/E/None",
    "durability": "A/B/C/D/E/None",
    "precision": "A/B/C/D/E/None",
    "potential": "A/B/C/D/E/None"
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
  referenceImage
}) => {
  const resolvedSong = song || 'an unspecified musical reference';
  const resolvedColor = color || 'bold contrasting palette';
  const resolvedPersonality = personality || 'mysterious psychic tension';
  const resolvedUserName = userName || 'Unknown User';
  const resolvedStandName = standName || 'Unknown Stand';

  return [
    'An authentic Japanese TV anime Stand eyecatch screenshot, bizarre and stylish action manga aesthetic, classic cel-shading, 16:9 landscape.',
    `User form inputs: Stand user "${resolvedUserName}", Stand name "${resolvedStandName}", music reference "${resolvedSong}", color direction "${resolvedColor}", personality or obsession "${resolvedPersonality}", reference photo: ${referenceImage ? 'yes' : 'no'}. Use these inputs as design DNA, not as visible text.`,
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

const shouldRetryWithoutImageResponseFormat = (response, text) => (
  (response.status === 400 || response.status === 500) &&
  /response_format|unsupported|unknown|invalid/i.test(text || '')
);

const shouldRequestImageBase64 = () => process.env.IMAGE_RESPONSE_FORMAT === 'b64_json';

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
      imageModel: requestedImageModel,
      imageSize: requestedImageSize,
      imageQuality: requestedImageQuality
    } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    const baseUrl = process.env.GEMINI_BASE_URL || 'https://api.bltcy.ai/';
    const textModel = requestedTextModel || process.env.GEMINI_MODEL || 'gemini-3-flash-preview';
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
      const { standName, userName, song, color, personality, referenceImage } = payload;
      const isGemini = imageModel.toLowerCase().includes('gemini');
      const isGptImage = imageModel.toLowerCase().includes('gpt-image');
      const imgApiKey = process.env.IMAGE_API_KEY || apiKey;
      const imgBaseUrl = process.env.IMAGE_BASE_URL || 'https://api.bltcy.ai/';
      const imageSize = requestedImageSize || process.env.IMAGE_SIZE || '1536x1024';
      const imageQuality = requestedImageQuality || process.env.IMAGE_QUALITY || 'medium';
      const prompt = buildEyecatchPrompt({
        standName,
        userName,
        song,
        color,
        personality,
        referenceImage
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
        if (shouldRequestImageBase64()) {
          body.response_format = 'b64_json';
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

          if (!response.ok && body.response_format && shouldRetryWithoutImageResponseFormat(response, rawText)) {
            console.warn('[Image] response_format=b64_json unsupported; retrying without it.');
            const retryBody = { ...body };
            delete retryBody.response_format;
            response = await fetch(url, {
              method: 'POST',
              headers,
              body: JSON.stringify(retryBody)
            });
            rawText = await response.text();
          }

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
