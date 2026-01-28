import React from 'react';
import '../styles/variables.css';

const DonateModal = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>赞赏 (SPONSOR)</h2>
          {/* Top Right Close Icon */}
          <button className="close-icon" onClick={onClose}>×</button>
        </div>
        <div className="modal-body" style={{ textAlign: 'center' }}>
          <p>如果你喜欢这个替身生成器，欢迎请我喝一杯阿帕茶。</p>

          <div className="qr-placeholder">
            <div className="qr-box">
              <img src="/sponsor.png" alt="赞赏码" className="qr-image" />
            </div>
            <p className="qr-hint">感谢您的支持！Arigato!</p>
          </div>

          <button className="close-btn-large" onClick={onClose}>
            关闭 (CLOSE)
          </button>
        </div>
      </div>

      <style>{`
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            padding-bottom: 10px;
            margin-bottom: 20px;
        }

        .modal-header h2 {
            margin: 0;
            color: var(--accent-color);
            font-size: 1.5rem;
        }

        .close-icon {
            background: transparent;
            border: none;
            color: rgba(255,255,255,0.5);
            font-size: 2rem;
            cursor: pointer;
            line-height: 1;
        }
        .close-icon:hover { color: white; }

        .qr-placeholder {
            margin-top: 20px;
            padding: 20px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            margin-bottom: 30px;
        }
        
        .qr-box {
            width: 220px;
            height: 220px;
            margin: 0 auto 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            padding: 10px;
            border-radius: 5px;
        }

        .qr-image {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }

        .qr-hint {
            color: var(--accent-color);
            font-weight: bold;
        }

        .close-btn-large {
            background: transparent;
            border: 2px solid var(--secondary-color);
            color: var(--secondary-color);
            padding: 10px 40px;
            font-size: 1.1rem;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.2s;
            width: 100%;
        }

        .close-btn-large:hover {
            background: var(--secondary-color);
            color: #000;
        }
      `}</style>
    </div>
  );
};

export default DonateModal;
