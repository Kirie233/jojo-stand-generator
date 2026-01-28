# JOJO 替身生成器 (JOJO Stand Generator)

**“你的替身正如你的灵魂，正在蠢蠢欲动……”**

这是一个基于 AI 驱动的 Web 应用程序，能够根据用户的特征（音乐喜好、性格欲望、代表色）自动生成独一无二的《JOJO的奇妙冒险》风格替身。不仅包含替身面板数据、能力描述，还能自动绘制出荒木飞吕彦画风的替身立绘。

![Project Preview](public/vite.svg)
*(建议在此处替换为您的项目截图)*

## 🌟 核心功能

*   **替身觉醒**：输入你的灵魂特征，AI 将为你“觉醒”一个专属替身。
*   **六维面板**：自动生成破坏力、速度、射程等六维雷达图。
*   **能力设计**：基于你的欲望生成的独特能力，绝非简单的元素堆砌。
*   **荒木画风绘制**：集成 Google Gemini / DALL-E 绘图接口，生成具有冲击力的 JOJO 风格立绘。
*   **历史记录**：自动保存你的替身觉醒记录，随时回顾。
*   **沉浸式 UI**：充满了“ゴゴゴ”氛围的视觉设计和交互动画。

## 🛠️ 技术栈

*   **前端**: React 19 + Vite
*   **样式**: Vanilla CSS (自定义变量系统，无框架依赖)
*   **AI 核心**: Google Gemini Pro (1.5 Flash / 3 Pro Image)
*   **部署**: Vercel Edge Functions (后端代理，安全保护 API Key)

## 🚀 本地开发指南

如果你想在本地运行此项目：

1.  **克隆仓库**
    ```bash
    git clone https://github.com/Kirie233/jojo-stand-generator.git
    cd jojo-stand-generator
    ```

2.  **安装依赖**
    ```bash
    npm install
    ```

3.  **配置环境变量**
    在项目根目录创建一个 `.env` 文件，并添加以下内容：
    ```env
    # Google Gemini API Key (必须)
    VITE_GEMINI_API_KEY=your_api_key_here

    # API Base URL (如果你使用中转服务，否则默认官方)
    VITE_GEMINI_BASE_URL=https://generativelanguage.googleapis.com

    # 文本生成模型
    VITE_GEMINI_MODEL=gemini-1.5-flash

    # 图像生成模型 (推荐 gemini-3-pro-image-preview 或 dall-e-3)
    VITE_IMAGE_MODEL=gemini-3-pro-image-preview

    # [可选] 独立配置画图接口 (如果不填，默认使用上面的 API Key 和 Base URL)
    # VITE_IMAGE_API_KEY=your_image_provider_key
    # VITE_IMAGE_BASE_URL=https://api.another-provider.com
    ```

4.  **启动开发服务器**
    ```bash
    npm run dev
    ```
    打开浏览器访问 `http://localhost:5173` 即可。

## ☁️ 部署指南 (Vercel)

本项目已针对 Vercel 进行了特定优化 (Edge Functions)，请务必按照以下步骤部署，以确保安全性：

1.  将项目 Fork 或上传到你的 GitHub。
2.  在 [Vercel](https://vercel.com) 导入该项目。
3.  **关键步骤**：在 Vercel 的 **Settings -> Environment Variables** 中配置以下变量（**不要**带 `VITE_` 前缀）：
    *   `GEMINI_API_KEY`: 您的 API Key
    *   `GEMINI_BASE_URL`: API 地址 (如 `https://www.wyjh.top`)
    *   `GEMINI_MODEL`: `gemini-1.5-flash`
    *   `IMAGE_MODEL`: `gemini-3-pro-image-preview`
    *   (可选) `IMAGE_API_KEY`: 独立的绘图 API Key
    *   (可选) `IMAGE_BASE_URL`: 独立的绘图中转地址
4.  点击 Deploy。线上环境会自动切换到安全的后端代理模式，保护您的 Key 不泄露。

## ⚠️ 免责声明

本项目是由《JOJO的奇妙冒险》粉丝制作的非营利性开源项目。所有通过 AI 生成的内容仅供娱乐。JOJO 的相关版权归 荒木飞吕彦 (Hirohiko Araki) 及 集英社 所有。

---
**To Be Continued...**
