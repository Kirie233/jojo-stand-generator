import React from 'react';
import '../styles/variables.css';

const HistoryList = ({ history, onLoad, onClose }) => {
  return (
    <div className="history-drawer open">
      <div className="history-header">
        <div className="history-header-left">
          <img src="/assets/icon_tarot_history.png" className="header-icon-mini" alt="Moody Blues" />
          <h3>觉醒历史 (AWAKENING HISTORY)</h3>
        </div>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="history-content-scroll">
        {history && history.length > 0 ? (
          <div className="history-items">
            {history.map((item) => (
              <div key={item.id} className="history-item" onClick={() => onLoad(item)}>
                <div className="history-item-top">
                  <div className="history-name">{item.userName || "未知宿主"}</div>
                  <div className="history-date">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </div>
                </div>
                <div className="history-stand-name">{item.name}</div>
                <div className="history-stats">
                  <span className="stat-tag">POWER:{item.stats.power}</span>
                  <span className="stat-tag">SPEED:{item.stats.speed}</span>
                </div>
                <div className="history-click-hint">点击回溯 (CLICK TO REPLAY)</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-history">
            <p>暂无觉醒记录</p>
            <div className="empty-icon">⏳</div>
          </div>
        )}
      </div>

      <style>{`
        .history-drawer {
            position: fixed;
            top: 0; right: 0;
            width: 360px; height: 100vh;
            /* Premium Glassmorphism */
            background: linear-gradient(135deg, rgba(26, 11, 46, 0.95) 0%, rgba(0, 0, 0, 0.98) 100%);
            backdrop-filter: blur(15px);
            border-left: 3px solid #ffd700;
            padding: 0;
            z-index: 11000; /* Extremely high z-index to avoid conflict */
            box-shadow: -10px 0 50px rgba(0,0,0,0.8);
            display: flex; flex-direction: column;
            animation: drawerSlideIn 0.5s cubic-bezier(0.19, 1, 0.22, 1);
        }

        @keyframes drawerSlideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
        }

        .history-header {
            display: flex; justify-content: space-between; align-items: center;
            padding: 25px 20px;
            background: rgba(255, 215, 0, 0.05);
            border-bottom: 2px solid rgba(255, 215, 0, 0.2);
        }

        .history-header-left { display: flex; align-items: center; gap: 15px; }

        .header-icon-mini {
            width: 40px; height: 55px; object-fit: cover;
            border: 2px solid #ffd700; filter: contrast(1.2);
        }

        .history-header h3 {
            color: #ffd700; margin: 0;
            font-family: 'ZCOOL KuaiLe'; font-size: 1.4rem;
            text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
        }

        .close-btn {
            background: none; border: none; color: #fff; font-size: 2rem;
            cursor: pointer; transition: all 0.3s;
        }
        .close-btn:hover { color: #ffd700; transform: rotate(90deg); }

        .history-content-scroll {
            flex: 1; overflow-y: auto; padding: 20px;
            scrollbar-width: thin; scrollbar-color: #ffd700 transparent;
        }

        .history-items { display: flex; flex-direction: column; gap: 15px; }

        .history-item {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 18px; cursor: pointer; transition: all 0.3s;
            position: relative; overflow: hidden;
        }
        .history-item:hover {
            background: rgba(255, 215, 0, 0.1);
            border-color: #ffd700; transform: translateX(-5px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }

        .history-item-top {
            display: flex; justify-content: space-between; align-items: flex-start;
            margin-bottom: 8px;
        }

        .history-name {
            font-family: 'Noto Serif SC'; font-weight: bold;
            color: rgba(255,255,255,0.7); font-size: 0.8rem;
        }

        .history-date { font-size: 0.75rem; color: rgba(255,255,255,0.4); }

        .history-stand-name {
            font-family: 'ZCOOL KuaiLe'; font-size: 1.3rem; color: #fff;
            margin-bottom: 12px; letter-spacing: 1px;
        }

        .history-stats { display: flex; gap: 10px; }
        .stat-tag {
            background: #000; border: 1px solid rgba(255, 215, 0, 0.3);
            color: #ffd700; padding: 2px 8px; font-size: 0.75rem;
            font-family: 'Anton'; letter-spacing: 1px;
        }

        .history-click-hint {
            margin-top: 15px; font-size: 0.7rem; color: #ffd700;
            opacity: 0; transition: all 0.3s; font-family: 'Anton';
            letter-spacing: 2px;
        }
        .history-item:hover .history-click-hint { opacity: 0.8; }

        .empty-history {
            text-align: center; padding: 100px 0; color: rgba(255,255,255,0.3);
            font-family: 'Noto Serif SC';
        }
        .empty-icon { font-size: 4rem; margin-top: 20px; opacity: 0.2; }
      `}</style>
    </div>
  );
};

export default HistoryList;
