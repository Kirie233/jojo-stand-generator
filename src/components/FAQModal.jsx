import React from 'react';
import '../styles/variables.css';

const FAQModal = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>常见问题 (FAQ)</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="faq-item">
            <h4>Q: 为什么图片生成这么慢？</h4>
            <p>A: 为了还原 JoJo 风格的细腻画质，我们使用了高质量的 AI 绘图模型（如 DALL-E 3 或 Gemini Pro Vision）。这些模型通常需要 <strong>30秒到 1分钟</strong> 才能完成绘制。为了防止超时，我们为此开启了 120秒 的超长待机模式，请耐心等待“替身觉醒”的过程。</p>
          </div>

          <div className="faq-item">
            <h4>Q: 出现 "504 Gateway Timeout" 怎么办？</h4>
            <p>A: 这通常是因为 Vercel 免费版限制接口必须在 10秒内返回。我们已经更新了<strong>混合生成模式 (Hybrid Mode)</strong> 来绕过此限制。如果您是部署者，请确保在 Vercel 环境变量中配置了以 <code>VITE_</code> 开头的 Key。</p>
          </div>

          <div className="faq-item">
            <h4>Q: 为什么生成的替身有时候不完全符合描述？</h4>
            <p>A: 替身是灵魂的投射，具有不可预测性。AI 会根据您的精神特质进行“艺术加工”。如果您觉得太离谱，可以点击顶部的“✨ 觉醒新替身”重试。</p>
          </div>

          <div className="faq-item">
            <h4>Q: 我的数据会丢失吗？</h4>
            <p>A: 不会！我们使用浏览器原生数据库 (IndexedDB)，所有历史记录都<strong>永久保存</strong>在您的本地设备上。即使关闭浏览器再打开，它们依然存在。</p>
          </div>
        </div>
      </div>

      <style>{`
        .modal-overlay {
          /* Uses global style */
          animation: modalFadeIn 0.3s ease;
        }

        .modal-content {
          background: #1a1a1a;
          border: 2px solid var(--accent-color);
          padding: 30px;
          max-width: 600px;
          width: 90%;
          max-height: 80vh; /* Scrollable if too long */
          overflow-y: auto;
          box-shadow: 0 0 20px var(--primary-color);
          position: relative;
        }

        /* Scrollbar styling for Webkit */
        .modal-content::-webkit-scrollbar {
          width: 8px;
        }
        .modal-content::-webkit-scrollbar-track {
          background: #222; 
        }
        .modal-content::-webkit-scrollbar-thumb {
          background: var(--accent-color); 
          border-radius: 4px;
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #333;
            padding-bottom: 15px;
            margin-bottom: 20px;
            position: sticky;
            top: -30px; /* Offset for padding */
            background: #1a1a1a;
            z-index: 1;
        }

        .modal-header h3 {
            color: var(--accent-color);
            margin: 0;
            font-family: var(--font-heading);
        }

        .close-btn {
            background: none;
            border: none;
            color: #fff;
            font-size: 1.5rem;
            cursor: pointer;
        }

        .faq-item {
            margin-bottom: 25px;
            border-bottom: 1px dashed #333;
            padding-bottom: 15px;
        }
        
        .faq-item:last-child {
            border-bottom: none;
        }

        .faq-item h4 {
            color: var(--secondary-color);
            margin-bottom: 10px;
            font-size: 1.1rem;
        }

        .faq-item p {
            color: #ccc;
            font-size: 0.95rem;
            line-height: 1.6;
        }
        
        code {
            background: #333;
            padding: 2px 5px;
            border-radius: 4px;
            color: #fff;
            font-family: monospace;
        }
      `}</style>
    </div>
  );
};

export default FAQModal;
