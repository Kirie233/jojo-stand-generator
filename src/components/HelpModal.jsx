import React from 'react';
import '../styles/variables.css';

const HelpModal = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>替身觉醒指南</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p>替身 (Stand) 是生命能源的具现化。以下三个要素将决定你觉醒出的替身形态：</p>

          <div className="help-item">
            <h4>🎵 灵魂共鸣之音 (Song)</h4>
            <p>输入你最喜欢的专辑、歌曲或歌手。这将直接决定替身的<strong>名字</strong>（遵循JOJO的音乐引用规则）。</p>
          </div>

          <div className="help-item">
            <h4>🎨 精神波纹之色 (Color)</h4>
            <p>输入代表你的颜色。这将决定替身的<strong>外观主色调</strong>和视觉氛围。</p>
          </div>

          <div className="help-item">
            <h4>🔥 欲望与执念 (Personality)</h4>
            <p>描述你的性格、渴望或恐惧。这是最重要的部分，将决定替身的<strong>特殊能力</strong>。</p>
          </div>
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          animation: fadeIn 0.2s;
        }

        .modal-content {
          background: #1a1a1a;
          border: 2px solid var(--accent-color);
          padding: 30px;
          max-width: 500px;
          width: 90%;
          box-shadow: 0 0 20px var(--primary-color);
          position: relative;
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #333;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }

        .modal-header h3 {
            color: var(--accent-color);
            margin: 0;
        }

        .close-btn {
            background: none;
            border: none;
            color: #fff;
            font-size: 1.5rem;
            cursor: pointer;
        }

        .help-item {
            margin-bottom: 20px;
        }

        .help-item h4 {
            color: var(--secondary-color);
            margin-bottom: 5px;
        }

        .help-item p {
            color: #ccc;
            font-size: 0.95rem;
            line-height: 1.5;
        }
      `}</style>
    </div>
  );
};

export default HelpModal;
