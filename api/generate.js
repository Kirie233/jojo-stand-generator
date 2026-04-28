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
2. 文案要短，不要写成长段。
3. desc 控制在 18 到 30 个字。
4. long_desc 控制在 60 到 100 个字。
5. mechanics 只保留 2 条，每条 content 控制在 35 到 60 个字。
6. limitations 只保留 2 条，每条尽量一句话。
7. appearance 使用简洁中文，控制在 45 到 80 个字，便于后续生图。
8. 不要输出 Markdown，不要加解释。

返回 JSON 结构：
{
  "name": "替身名",
  "type": "替身类型",
  "panel": {
    "abilityName": "能力名",
    "desc": "一句话能力摘要",
    "long_desc": "简洁的外观与能力说明",
    "mechanics": [
      {
        "title": "核心能力：xx",
        "content": "简洁说明"
      },
      {
        "title": "衍生应用：xx",
        "content": "简洁说明"
      }
    ],
    "limitations": [
      "限制一",
      "限制二"
    ],
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
  appearance,
  standName,
  userName,
  song,
  color,
  personality,
  referenceImage
}) => {
  const resolvedSong = song || 'an unspecified musical reference';
  const backgroundStyle = `${color || 'bold contrasting'} radial burst with retro TV scanline texture, manga speed lines, and a dramatic mood shaped by ${personality || 'mysterious psychic tension'}, inspired by ${resolvedSong}`;
  const referenceNote = referenceImage
    ? 'The user also provided a reference photo; preserve any distinctive silhouette, facial impression, or styling cues already reflected in the stand concept.'
    : 'No reference photo was provided.';

  return `Authentic Japanese TV anime eyecatch screenshot, 16:9 landscape composition, bizarre stylish action manga aesthetic, classic anime cel-shading.

Background: ${backgroundStyle}

Story context: The Stand is named "${standName || 'Unknown Stand'}" and belongs to "${userName || 'Unknown User'}". Use this only as design inspiration; do not render any visible text.

Canvas and framing: Wide horizontal 16:9 frame only, landscape orientation, cinematic TV eyecatch. Do not use a vertical poster, portrait crop, phone wallpaper, centered full-body poster, or tall character-card composition.

Character layout: Put the Stand on the left or center-left, occupying about 45% of the frame width. Show the upper body and dynamic silhouette cropped naturally by the wide frame. Leave the right half and lower corners cleaner and darker as negative space for later UI overlay.

Character: A highly stylized psychic guardian avatar, ${appearance}. The design should channel the emotional and symbolic feel of the music reference "${resolvedSong}" and the user's inner drive "${personality || 'mysterious resolve'}". ${referenceNote} Striking an exaggerated, bizarre, dynamic pose. Varied line weight, distinct hard-edge anime shadows, unique palette.

Graphic direction: Use the full horizontal canvas with sweeping speed lines and background energy extending across the width. Suggest the mood of a circular stat chart area using composition only. Do not draw an actual radar chart, labels, numbers, rings, UI boxes, or typography. The right side may contain subtle glow, framing, or empty spotlight space where a stat panel could be overlaid later.

Constraints: NO text, NO letters, NO words, NO numbers, NO subtitles, NO logos, NO watermarks, NO captions, NO radar chart, NO stat wheel, NO interface elements, NO embedded nameplates. Keep the composition readable and leave overlay-safe empty space.

Vibe: Retro TV broadcast quality, high contrast, visually striking wide composition.`;
};

const jsonResponse = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const shouldRetryWithoutImageResponseFormat = (response, text) => (
  response.status === 400 &&
  /response_format|unsupported|unknown|invalid/i.test(text || '')
);

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
      const { appearance, standName, userName, song, color, personality, referenceImage } = payload;
      const isGemini = imageModel.toLowerCase().includes('gemini');
      const isGptImage = imageModel.toLowerCase().includes('gpt-image');
      const imgApiKey = process.env.IMAGE_API_KEY || apiKey;
      const imgBaseUrl = process.env.IMAGE_BASE_URL || 'https://api.bltcy.ai/';
      const imageSize = requestedImageSize || process.env.IMAGE_SIZE || '1536x1024';
      const imageQuality = requestedImageQuality || process.env.IMAGE_QUALITY || 'medium';
      const prompt = buildEyecatchPrompt({
        appearance,
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
          size: imageSize,
          response_format: 'b64_json'
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
