# JOJO 替身生成器

> 你的替身，正如你的灵魂。

一个 JOJO 风格的 AI 替身生成 Web 应用。输入名字、音乐灵感、主色调、性格/执念和参考图后，应用会生成替身名称、能力档案、六维面板，并绘制对应的替身视觉图。

![JOJO Stand Generator Preview](public/assets/preview_v2.jpg)

## 快速入口

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FKirie233%2Fjojo-stand-generator&project-name=jojo-stand-generator&repository-name=jojo-stand-generator&env=TEXT_API_KEY,TEXT_BASE_URL,TEXT_MODEL,IMAGE_API_KEY,IMAGE_BASE_URL,IMAGE_MODEL&envDescription=Configure%20AI%20API%20keys%20and%20model%20settings%20for%20JOJO%20Stand%20Generator&envLink=https%3A%2F%2Fgithub.com%2FKirie233%2Fjojo-stand-generator%23%E7%8E%AF%E5%A2%83%E5%8F%98%E9%87%8F)

推荐接口服务：[柏拉图 AI](https://api.bltcy.ai/register?aff=4AcV128715)

## 功能

- 根据表单输入生成替身名称、能力、面板、战吼和台词。
- 文本生成和图片生成分离，可分别配置模型、Key 和接口地址。
- 展示 JOJO 风格六维面板：破坏力、速度、射程距离、持续力、精密动作性、成长性。
- 支持图片纯览模式，隐藏 UI 只查看生成图。
- 使用 IndexedDB 保存本地觉醒历史，并显示当前站点存储占用。
- 生产环境通过 Vercel API Route 代理模型请求，避免服务端 Key 暴露到前端。

## 技术栈

React 19、Vite、Vanilla CSS、IndexedDB、Vercel Edge Functions。

## 本地开发

```bash
npm install
cp .env.example .env
npm run dev
```

默认访问：`http://localhost:5173`

`.env` 示例：

```env
VITE_TEXT_API_KEY=your_text_key
VITE_TEXT_BASE_URL=https://api.bltcy.ai/
VITE_TEXT_MODEL=gemini-3-flash-preview

VITE_IMAGE_API_KEY=your_image_key
VITE_IMAGE_BASE_URL=https://api.bltcy.ai/
VITE_IMAGE_MODEL=gpt-image-2
```

`VITE_*` 变量会暴露到前端，只建议本地开发使用。

## Vercel 部署

生产环境只需要配置服务端环境变量：

| Key | 必填 | 默认/示例 | 说明 |
| :--- | :--- | :--- | :--- |
| `TEXT_API_KEY` | 是 | `sk-xxx...` | 文本生成 Key |
| `TEXT_BASE_URL` | 否 | `https://api.bltcy.ai/` | 文本接口地址 |
| `TEXT_MODEL` | 否 | `gemini-3-flash-preview` | 文本模型 |
| `IMAGE_API_KEY` | 否 | `sk-xxx...` | 图片生成 Key，不填则复用 `TEXT_API_KEY` |
| `IMAGE_BASE_URL` | 否 | `https://api.bltcy.ai/` | 图片接口地址 |
| `IMAGE_MODEL` | 否 | `gpt-image-2` | 图片模型 |

部署后请求链路：

```text
浏览器 -> Vercel /api/generate 或 /api/gemini -> AI API
```

不要在 Vercel 生产环境配置 `VITE_*` Key。

旧变量 `GEMINI_API_KEY`、`GEMINI_BASE_URL`、`GEMINI_MODEL` 仍可作为兼容 fallback 使用。

## 脚本

```bash
npm run dev      # 本地开发
npm run build    # 生产构建
npm run preview  # 预览构建产物
npm run lint     # ESLint 检查
```

## 说明

- `.env` 只用于本地开发，不要提交到仓库。
- 文本模型和图片模型可以使用不同 Key、不同接口。
- 当前默认生图模型是 `gpt-image-2`，同时保留 Gemini 生图兼容逻辑。

## 友情链接

感谢 [LINUX DO](https://linux.do/) 朋友们的支持与反馈。

## 免责声明

本项目为 JOJO 粉丝向非商业项目。AI 生成内容仅供娱乐和学习使用。相关作品版权归原作者及版权方所有。

---

**To Be Continued...**
