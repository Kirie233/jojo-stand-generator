import React from 'react';
import '../styles/variables.css';

const NavBar = ({ onReset, onToggleHistory, onToggleHelp, onToggleDonate, onToggleFAQ }) => {
  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={onReset} title="重置 / Reset">
        JOJO 替身生成器
      </div>

      <div className="navbar-actions">
        <button onClick={onReset} className="nav-btn create-btn">
          ✨ 觉醒新替身
        </button>
        <button onClick={onToggleDonate} className="nav-btn sponsor-btn">
          💖 赞赏
        </button>
        <button onClick={onToggleHelp} className="nav-btn help-btn">
          ❓ 指南
        </button>
        <button onClick={onToggleFAQ} className="nav-btn help-btn">
          💬 FAQ
        </button>
        <button onClick={onToggleHistory} className="nav-btn history-btn">
          📜 觉醒历史
        </button>
      </div>

      <style>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 60px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 20px;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(189, 0, 255, 0.3);
          z-index: 999;
          box-shadow: 0 2px 10px rgba(0,0,0,0.5);
        }

        .navbar-brand {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          color: var(--accent-color);
          cursor: pointer;
          text-shadow: 2px 2px var(--primary-color);
          transition: transform 0.2s;
        }

        .navbar-brand:hover {
          transform: scale(1.05);
        }

        .navbar-actions {
          display: flex;
          gap: 15px;
        }

        .nav-btn {
          background: transparent;
          border: 1px solid transparent;
          color: #eee;
          font-size: 0.9rem;
          cursor: pointer;
          padding: 5px 10px;
          border-radius: 4px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .nav-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .sponsor-btn {
          color: #ff6b6b;
        }
        
        .sponsor-btn:hover {
            background: rgba(255, 107, 107, 0.1);
            border-color: #ff6b6b;
        }

        .create-btn {
            background: var(--primary-color);
            color: var(--bg-color);
            border-color: var(--primary-color);
            font-weight: bold;
        }

        .create-btn:hover {
            background: var(--accent-color);
            border-color: var(--accent-color);
            transform: translateY(-1px);
            box-shadow: 0 0 10px rgba(189, 0, 255, 0.5);
        }
      `}</style>
    </nav>
  );
};

export default NavBar;
