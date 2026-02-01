import React from 'react';
import '../styles/variables.css';

const DonateModal = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="harvest-modal-content" onClick={e => e.stopPropagation()}>

        {/* HARVEST DECORATION */}
        <div className="harvest-header-icon">
          <img src="/assets/icon_tarot_harvest.png" alt="Harvest" className="shigechi-icon" />
        </div>

        <div className="modal-header-shigechi">
          <h2>收成时刻 (HARVEST)</h2>
          <p className="shigechi-dialogue">
            "希希希... 只要给我一枚硬币，<br />
            我就能为你收集更多的替身创意！"
          </p>
        </div>

        <div className="modal-body">
          <div className="coin-bag-container">
            <div className="qr-wrapper">
              {/* Replace with actual sponsor QR if available, or keep placeholder logic */}
              <img src="/assets/reward_qrcode.png"
                alt="Donate QR"
                className="qr-code-img"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
              />
              <div className="qr-fallback" style={{ display: 'none' }}>
                <span>QR CODE LOADER BROKEN<br />BUT THE GOLDEN SPIRIT IS HERE</span>
              </div>
            </div>

            <div className="coin-pile">
              <span className="coin c1">
                <svg viewBox="0 0 24 24" className="coin-svg"><circle cx="12" cy="12" r="10" fill="#FFD700" stroke="#000" strokeWidth="2" /><text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#000">G</text></svg>
              </span>
              <span className="coin c2">
                <svg viewBox="0 0 24 24" className="coin-svg"><circle cx="12" cy="12" r="10" fill="#FFD700" stroke="#000" strokeWidth="2" /><text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#000">G</text></svg>
              </span>
              <span className="coin c3">
                <svg viewBox="0 0 24 24" className="coin-svg"><circle cx="12" cy="12" r="10" fill="#FFD700" stroke="#000" strokeWidth="2" /><text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#000">G</text></svg>
              </span>
            </div>
          </div>

          <p className="donate-hint">
            支持开发者 (Support User's Passion)
          </p>

          <button className="close-btn-harvest" onClick={onClose}>
            不要太贪心了 (CLOSE)
          </button>
        </div>

      </div>

      <style>{`
        .harvest-modal-content {
            background: #fff;
            width: 350px;
            border: 4px solid #FFD700;
            border-radius: 20px;
            position: relative;
            padding: 20px;
            text-align: center;
            box-shadow: 0 0 50px rgba(255, 215, 0, 0.4);
            animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            /* Comic Pattern Background */
            background-image: radial-gradient(#FFD700 10%, transparent 10%), radial-gradient(#FFD700 10%, transparent 10%);
            background-size: 20px 20px;
            background-color: #fffacd; /* Lemon Chiffon */
        }

        .harvest-header-icon {
            position: absolute;
            top: -40px; left: 50%;
            transform: translateX(-50%);
            width: 80px; height: 80px;
            background: #fff;
            border: 4px solid #FFD700;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            z-index: 10;
        }
        .shigechi-icon { width: 60px; height: 60px; object-fit: contain; }

        .modal-header-shigechi {
            margin-top: 30px;
            margin-bottom: 20px;
        }
        .modal-header-shigechi h2 {
            font-family: 'ZCOOL KuaiLe', cursive;
            color: #B8860B; /* Dark Goldenrod */
            font-size: 1.8rem;
            margin: 0;
            text-shadow: 2px 2px 0 #fff;
        }
        .shigechi-dialogue {
            font-family: 'Noto Serif SC', serif;
            font-style: italic;
            color: #555;
            background: #fff;
            padding: 10px;
            border-radius: 10px;
            border: 2px dashed #FFD700;
            margin-top: 10px;
            font-size: 0.9rem;
        }

        .coin-bag-container {
            background: #fff;
            border: 3px solid #000;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            position: relative;
            box-shadow: 5px 5px 0 rgba(0,0,0,0.2);
            transform: rotate(-2deg);
            transition: transform 0.3s;
        }
        .coin-bag-container:hover {
            transform: rotate(0deg) scale(1.02);
      
        }

        .qr-wrapper {
            width: 200px; height: 200px;
            margin: 0 auto;
            background: #eee;
            display: flex; align-items: center; justify-content: center;
            overflow: hidden;
        }
        .qr-code-img { width: 100%; height: 100%; object-fit: contain; }
        .qr-fallback { 
            width: 100%; height: 100%; 
            display: flex; align-items: center; justify-content: center; 
            text-align: center; color: #aaa; font-size: 0.8rem;
        }

        .coin-pile {
            position: absolute;
            bottom: -15px; right: -15px;
            font-size: 2rem;
            display: flex;
        }
        .coin { 
            display: inline-block; 
            filter: drop-shadow(2px 2px 0 rgba(0,0,0,0.3));
            animation: bounce 2s infinite; 
            width: 32px; height: 32px; /* Fixed size for SVG container */
        }
        .coin-svg { width: 100%; height: 100%; }
        .c1 { animation-delay: 0s; }
        .c2 { animation-delay: 0.2s; }
        .c3 { animation-delay: 0.4s; }

        .donate-hint {
            font-family: 'Bangers', cursive;
            letter-spacing: 1px;
            color: #B8860B;
            font-size: 1.2rem;
        }

        .close-btn-harvest {
            background: #FFD700;
            color: #000;
            border: 3px solid #000;
            padding: 10px 30px;
            font-family: 'ZCOOL KuaiLe', cursive;
            font-size: 1.2rem;
            cursor: pointer;
            box-shadow: 4px 4px 0 #000;
            transition: all 0.2s;
            width: 100%;
        }
        .close-btn-harvest:hover {
            transform: translate(-2px, -2px);
            box-shadow: 6px 6px 0 #000;
            background: #fff;
        }

        @keyframes popIn {
             from { transform: scale(0.8); opacity: 0; }
             to { transform: scale(1); opacity: 1; }
        }
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
};

export default DonateModal;
