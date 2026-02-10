# JOJO 替身生成器 (JOJO Stand Generator)

> **“你的替身正如你的灵魂，正在蠢蠢欲动……”**

这是一个基于 AI 驱动的 Web 应用程序，能够根据用户的特征（音乐喜好、性格欲望、代表色）自动生成独一无二的《JOJO的奇妙冒险》风格替身。

不仅仅是生成数据，我们致力于还原**90年代经典 OVA 动画的视觉风格**。从闪耀着神秘光芒的雷达图，到充满颗粒感复古质感，再到荒木飞吕彦老师标志性的肌肉线条与姿势，一切只为让你体验最纯正的“觉醒”时刻。

![JOJO Stand Generator Preview](public/assets/preview_v2.jpg)
*(生成的替身卡片效果示例 / Generated Preview)*

## 🌟 核心功能 (Features)

*   **🧘 替身觉醒 (Soul Awakening)**
    *   输入你的“精神特质”，AI 将深度解析并为你匹配最契合的替身能力。
    *   绝非简单的随机组合，每个替身都有独特的“破坏力、速度、精密性”等六维面板。

*   **🎨 荒木画风绘制 (Araki Style Art)**
    *   集成 Google Gemini / DALL-E 绘图接口。
    *   **极致的复古美学**：自动应用胶片颗粒、径向模糊、高对比度滤镜，模拟90年代赛璐璐动画截图质感。
    *   **完美融合**：角色与背景无缝融合，仿佛从虚空中浮现。

*   **📊 动态雷达图 (Dynamic Radar Chart)**
    *   复刻“白金之星”过场动画风格的六维雷达图。
    *   带有动态刻度、金属质感边框和发光特效。
    *   **智能排版**：无论替身名字多长，雷达图都能自动调整位置，互不遮挡。

*   **💾 无限觉醒历史 (Unlimited History)**
    *   **IndexedDB 驱动**：利用浏览器本地数据库，突破 LocalStorage 容量限制。
    *   **永久保存**：你可以生成成百上千个替身，高清大图和详细设定都会被完整保留在你的设备上。
    *   **安全隐私**：所有数据存储在本地，不会上传到任何服务器。

*   **🌍 双语支持 (Bilingual Support)**
    *   自动生成标准的英文替身名 + 中文译名 (e.g. `Star Platinum (白金之星)`).

## 🛠️ 技术栈 (Tech Stack)

*   **前端 Core**: React 19 + Vite
*   **样式 Engine**: Vanilla CSS (自定义变量系统，无 Tailwind/Bootstrap 依赖，极致轻量)
*   **本地数据库**: IndexedDB (原生 API)
*   **AI 接口**: Google Gemini Pro (3 Flash Preview / 3 Pro Image)
*   **部署**: Vercel Edge Functions (后端代理架构，保护 API Key 不泄露)

## 🚀 本地开发 (Development)

1.  **克隆仓库**
    ```bash
    git clone https://github.com/Kirie233/jojo-stand-generator.git
    cd jojo-stand-generator
    ```

2.  **安装依赖**
    ```bash
    npm install
    # 推荐使用 pnpm 或 yarn
    ```

3.  **配置环境变量**
    复制 `.env` 文件（如果没有请新建），并填入你的 API Key：
    ```env
    # Google Gemini API Key (必须，用于文本和图像生成)
    VITE_GEMINI_API_KEY=your_api_key_here

    # [可选] 自定义 API 地址 (如果你使用中转/代理)
    VITE_GEMINI_BASE_URL=https://generativelanguage.googleapis.com

    # [可选] 自定义模型
    VITE_GEMINI_MODEL=gemini-3-flash-preview
    VITE_IMAGE_MODEL=gemini-3-pro-image-preview
    ```

4.  **启动替身使者**
    ```bash
    npm run dev
    ```
    访问 `http://localhost:5173` 开始觉醒。

## ☁️ 部署指南 (Deployment Guide)

### 1. 导入项目 (Import Project)
1.  **Fork** 本项目到您的 GitHub 账号。
2.  登录 [Vercel](https://vercel.com)。
3.  点击 **"Add New..."** -> **"Project"**。
4.  选择导入您刚刚 Fork 的 `jojo-stand-generator` 仓库。

### 2. 配置环境变量 (Environment Variables) - ⚠️ 重要步骤
在 Vercel 的 "Configure Project" 页面，点开 **"Environment Variables"** 选项卡，添加以下变量：

| 变量名 (Key) | 示例值 (Value) | 说明 |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | `sk...` | **[必填]** 后端用 Key |
| `GEMINI_BASE_URL` | `https://...` | **[选填]** 后端请求地址 |
| `GEMINI_MODEL` | `gemini-1.5-flash` | **[选填]** 指定思考模型 |
| `IMAGE_MODEL` | `dall-e-3` | **[选填]** 指定画图模型 |
| `VITE_GEMINI_API_KEY` | `sk...` | **[混合模式必填]** 前端直连用 (防超时) |
| `VITE_GEMINI_BASE_URL`| `https://...` | **[混合模式必填]** 前端请求地址 |

> **提示：** 为了防止绘图超时 (504 Error)，强烈建议同时配置 `VITE_` 开头的变量。

### 3. 开始部署 (Deploy)
1.  点击底部的 **Deploy** 按钮。
2.  等待约 1 分钟构建完成。
3.  点击 **Visit** 即可访问您的线上替身生成器！

### 4. 后续更新
只要您向 GitHub 仓库推送了新代码 (`git push`)，Vercel 会自动触发重新部署，无需额外操作。

## ⚠️ 免责声明

本项目是由《JOJO的奇妙冒险》粉丝制作的非营利性开源项目。所有通过 AI 生成的内容仅供娱乐。JOJO 的相关版权归 **荒木飞吕彦 (Hirohiko Araki)** 及 **集英社 (SHUEISHA)** 所有。

> *“人类的赞歌就是勇气的赞歌！人类的伟大就是勇气的伟大！”*

---
**To Be Continued... ➡️**
