import React from 'react';
import '../styles/variables.css';

const HistoryList = ({ history, onLoad, onClose }) => {
  if (!history || history.length === 0) return null;

  return (
    <div className="history-drawer">
      <div className="history-header">
        <h3>替身名录 (History)</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      <div className="history-items">
        {history.map((item) => (
          <div key={item.id} className="history-item" onClick={() => onLoad(item)}>
            <div className="history-name">{item.name}</div>
            <div className="history-date">
              {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString()}
            </div>
            <div className="history-stats">
              {item.stats.power} / {item.stats.speed}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .history-drawer {
            position: fixed;
            top: 0;
            right: 0;
            width: 300px;
            height: 100vh;
            background: rgba(0, 0, 0, 0.95);
            border-left: 2px solid var(--accent-color);
            padding: 20px;
            z-index: 1000;
            box-shadow: -5px 0 15px rgba(0,0,0,0.5);
            transform: translateX(100%);
            animation: slideIn 0.3s forwards;
            overflow-y: auto;
        }
        
        .history-drawer.open {
            transform: translateX(0);
        }

        @keyframes slideIn {
            to { transform: translateX(0); }
        }

        .history-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid var(--secondary-color);
            padding-bottom: 10px;
            margin-bottom: 20px;
        }

        .history-header h3 {
            color: var(--secondary-color);
            margin: 0;
        }

        .close-btn {
            background: none;
            border: none;
            color: var(--text-color);
            font-size: 1.5rem;
            cursor: pointer;
        }

        .history-item {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--primary-color);
            padding: 15px;
            margin-bottom: 10px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .history-item:hover {
            background: var(--primary-color);
            color: var(--bg-color);
        }

        .history-name {
            font-weight: bold;
            color: var(--accent-color);
            margin-bottom: 5px;
        }
        
        .history-item:hover .history-name {
            color: var(--bg-color);
        }

        .history-date {
            font-size: 0.8rem;
            opacity: 0.7;
        }
      `}</style>
    </div>
  );
};

export default HistoryList;
