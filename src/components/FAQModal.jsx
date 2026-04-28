import React from 'react';
import '../styles/variables.css';

const FAQ_ITEMS = [
  {
    question: 'Q: 为什么生成图片有时会比较慢？',
    answer: (
      <>
        图片生成通常比文本生成慢，尤其是在使用 <code>gpt-image-2</code> 或 Gemini
        生图模型时。当前项目已经把图片请求超时时间放宽到 120 秒，如果只是等待较久，通常不是故障。
      </>
    ),
  },
  {
    question: 'Q: 本地开发时出现 Failed to fetch / CORS 报错怎么办？',
    answer: (
      <>
        这通常是浏览器拦截了前端对外部模型接口的直连请求。现在项目会优先通过本地开发代理转发默认文本接口和默认图片接口，
        能明显降低 <code>CORS</code> 问题的出现概率。若你自定义了接口地址，请确认该地址允许代理转发，或改用服务端部署方式调用。
      </>
    ),
  },
  {
    question: 'Q: 线上部署时应该配置哪些变量？',
    answer: (
      <>
        生产环境优先使用服务端变量，例如 <code>GEMINI_API_KEY</code>、<code>GEMINI_BASE_URL</code>、
        <code>IMAGE_API_KEY</code>、<code>IMAGE_BASE_URL</code>、<code>IMAGE_MODEL</code>。不要把
        <code>VITE_</code> 前缀的密钥变量放到公开前端环境里。
      </>
    ),
  },
  {
    question: 'Q: 默认生图模型是什么，还能不能继续用 Gemini 生图？',
    answer: (
      <>
        当前默认生图模型是 <code>gpt-image-2</code>，同时仍然保留 Gemini 生图支持。只要在环境变量里把
        <code>IMAGE_MODEL</code> 或 <code>VITE_IMAGE_MODEL</code> 改成 <code>gemini</code> 或你实际使用的
        Gemini 图片模型名即可。
      </>
    ),
  },
  {
    question: 'Q: 我的历史记录会丢吗？',
    answer: (
      <>
        不会。历史记录默认保存在浏览器本地的 IndexedDB 中。只要不主动清除浏览器站点数据，历史记录通常都会保留。
      </>
    ),
  },
];

const FAQModal = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content faq-modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h3>常见问题 (FAQ)</h3>
          <button className="close-btn" onClick={onClose} type="button">
            ×
          </button>
        </div>

        <div className="modal-body">
          {FAQ_ITEMS.map((item) => (
            <section key={item.question} className="faq-item">
              <h4>{item.question}</h4>
              <p>{item.answer}</p>
            </section>
          ))}
        </div>
      </div>

      <style>{`
        .faq-modal {
          background: #1a1a1a;
          border: 2px solid var(--accent-color);
          padding: 30px;
          max-width: 640px;
          width: min(92vw, 640px);
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 0 20px var(--primary-color);
          position: relative;
        }

        .faq-modal::-webkit-scrollbar {
          width: 8px;
        }

        .faq-modal::-webkit-scrollbar-track {
          background: #222;
        }

        .faq-modal::-webkit-scrollbar-thumb {
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
          top: -30px;
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
          font-size: 1.6rem;
          line-height: 1;
          cursor: pointer;
        }

        .faq-item {
          margin-bottom: 22px;
          border-bottom: 1px dashed #333;
          padding-bottom: 14px;
        }

        .faq-item:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }

        .faq-item h4 {
          color: var(--secondary-color);
          margin: 0 0 10px;
          font-size: 1.05rem;
        }

        .faq-item p {
          color: #ccc;
          font-size: 0.95rem;
          line-height: 1.7;
          margin: 0;
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
