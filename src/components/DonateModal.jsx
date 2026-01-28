import React from 'react';
import '../styles/variables.css';

const DonateModal = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>赞赏 (Sponsor)</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body" style={{ textAlign: 'center' }}>
          <p>如果你喜欢这个替身生成器，欢迎请我喝一杯阿帕茶。</p>

          <div className="qr-placeholder">
            <div className="qr-box">
              <img src="/sponsor.png" alt="赞赏码" className="qr-image" />
            </div>
            <p className="qr-hint">感谢您的支持！Arigato!</p>
          </div>
        </div>
      </div>

      <style>{`
        .qr-placeholder {
            margin-top: 30px;
            padding: 20px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
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
      `}</style>
    </div>
  );
};

export default DonateModal;
