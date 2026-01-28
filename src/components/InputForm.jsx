import React, { useState } from 'react';
import '../styles/variables.css';

const InputForm = ({ onSubmit }) => {
  const [userName, setUserName] = useState('');
  const [song, setSong] = useState('');
  const [color, setColor] = useState('');
  const [personality, setPersonality] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!song || !color || !personality || !userName) return;
    onSubmit({ userName, song, color, personality });
  };

  return (
    <form className="jojo-form" onSubmit={handleSubmit}>
      <h2 className="form-title">替身觉醒仪式</h2>

      <div className="form-group">
        <label>本体名称</label>
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="例如: 空条承太郎, Giorno, DIO"
          required
        />
      </div>

      <div className="form-group">
        <label>1. 灵魂共鸣之音 (喜欢的歌曲/歌手)</label>
        <input
          type="text"
          value={song}
          onChange={(e) => setSong(e.target.value)}
          placeholder="例如: Killer Queen / Michael Jackson"
          required
        />
      </div>

      <div className="form-group">
        <label>2. 精神波纹之色 (代表颜色)</label>
        <input
          type="text"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          placeholder="例如: 霓虹粉, 深渊黑, 黄金"
          required
        />
      </div>

      <div className="form-group">
        <label>3. 欲望与执念 (精神特质)</label>
        <textarea
          value={personality}
          onChange={(e) => setPersonality(e.target.value)}
          placeholder="例如: 想要守护安宁的生活 / 想要拥有支配时间的力量..."
          rows="3"
          required
        />
      </div>

      <button type="submit" className="stand-button">
        觉醒 (<span className="kana">Awaken</span>)
      </button>

      <style>{`
        .jojo-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-width: 600px;
          margin: 0 auto;
          padding: 40px;
          background: rgba(10, 5, 20, 0.8);
          border: 3px solid var(--primary-color);
          box-shadow: 10px 10px 0 var(--menacing-color);
          position: relative;
          clip-path: polygon(
            0 0, 100% 0, 100% 90%, 90% 100%, 0 100%
          );
        }

        .form-title {
            text-align: center;
            color: var(--accent-color);
            border-bottom: 2px solid var(--secondary-color);
            padding-bottom: 15px;
            margin-bottom: 10px;
            font-size: 2rem;
            text-shadow: 0 0 10px var(--primary-color);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          text-align: left;
        }

        label {
          color: var(--secondary-color);
          font-family: var(--font-heading);
          font-size: 1.1rem;
          letter-spacing: 1px;
        }

        input, textarea {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid var(--primary-color);
          border-left: 5px solid var(--primary-color);
          color: white;
          padding: 12px;
          font-family: var(--font-body);
          font-size: 1rem;
        }

        input:focus, textarea:focus {
          background: rgba(255, 255, 255, 0.15);
          outline: none;
          border-color: var(--accent-color);
          box-shadow: 0 0 15px var(--primary-color);
        }

        .stand-button {
          margin-top: 20px;
          background: linear-gradient(45deg, var(--primary-color), var(--menacing-color));
          color: white;
          border: none;
          padding: 15px;
          font-family: var(--font-heading);
          font-size: 1.8rem;
          clip-path: polygon(10% 0, 100% 0, 100% 100%, 0% 100%);
          cursor: pointer;
          transition: all 0.3s;
          text-shadow: 2px 2px 0 #000;
        }

        .stand-button:hover {
          transform: scale(1.05) translate(-5px, -5px);
          box-shadow: 5px 5px 0 var(--accent-color);
          background: linear-gradient(45deg, var(--secondary-color), var(--primary-color));
        }

        .kana {
            font-size: 1rem;
            margin-left: 10px;
            opacity: 0.8;
        }
      `}</style>
    </form>
  );
};

export default InputForm;
