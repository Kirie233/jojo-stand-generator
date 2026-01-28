import React from 'react';
import StatRadar from './StatRadar';
import '../styles/variables.css';

const StandCard = ({ standData }) => {
  if (!standData) return null;

  const { name, abilityName, ability, stats, shout } = standData;

  const translatedLabels = {
    power: '破坏力',
    speed: '速度',
    range: '射程',
    durability: '持续力',
    precision: '精密性',
    potential: '成长性'
  };

  return (
    <div className="stand-card-container">
      <div className="stand-card">
        {/* Header / Name */}
        <div className="card-header">
          <h2 className="stand-name">「{name}」</h2>
          <div className="stand-user">本体: {standData.userName || 'YOU'}</div>
        </div>

        <div className="card-body">
          {/* Visual Area - Left */}
          <div className="stand-visual">
            {standData.imageUrl ? (
              <img src={standData.imageUrl} alt={name} className="stand-image" />
            ) : (
              <div className="visual-placeholder">
                <span className="menacing-bg">ゴゴゴ</span>
                <div className="stand-shout">"{shout}"</div>
                <div className="generating-hint">图像生成中... GENERATING IMAGE</div>
              </div>
            )}
          </div>

          {/* Stats Area - Right */}
          <div className="stand-stats-container">
            <div className="radar-wrapper">
              <StatRadar stats={stats} labels={translatedLabels} />
            </div>
          </div>
        </div>

        {/* Ability Section */}
        <div className="stand-ability">
          <h3 className="ability-title">
            <span className="bracket">『</span>
            {abilityName || '能力'}
            <span className="bracket">』</span>
          </h3>
          <p>{ability}</p>
        </div>
      </div>

      <style>{`
        .stand-card-container {
            perspective: 1000px;
            margin-top: 2rem;
            animation: fadeIn 1s ease-out;
            font-family: var(--font-body);
        }

        .stand-card {
            background: linear-gradient(135deg, #1a0b2e 0%, #000 100%);
            border: 4px solid var(--accent-color);
            border-radius: 2px;
            padding: 25px;
            max-width: 900px;
            width: 100%;
            box-shadow: 10px 10px 0 var(--primary-color);
            position: relative;
            transform-style: preserve-3d;
            overflow: hidden;
        }

        .stand-card::before {
            content: '';
            position: absolute;
            top: 10px; left: 10px; right: 10px; bottom: 10px;
            border: 1px solid rgba(255,255,255,0.1);
            pointer-events: none;
        }

        .card-header {
            text-align: center;
            border-bottom: 3px solid var(--secondary-color);
            padding-bottom: 15px;
            margin-bottom: 25px;
        }

        .stand-name {
            font-size: 2.5rem;
            color: var(--accent-color);
            text-shadow: 2px 2px var(--primary-color);
            margin-bottom: 5px;
            font-family: var(--font-heading);
            letter-spacing: 2px;
        }

        .stand-user {
            color: var(--subtext-color);
            letter-spacing: 5px;
            font-size: 0.9rem;
            text-transform: uppercase;
        }

        .card-body {
            display: flex;
            flex-wrap: wrap;
            gap: 30px;
            justify-content: center;
            align-items: flex-start;
        }

        .stand-visual {
            flex: 1;
            min-width: 300px;
            min-height: 350px;
            background: rgba(0,0,0,0.5);
            border: 2px solid var(--primary-color);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
        }

        .menacing-bg {
            position: absolute;
            font-size: 5rem;
            color: rgba(189, 0, 255, 0.1);
            z-index: 0;
            animation: float 3s infinite ease-in-out;
        }

        .visual-placeholder {
            text-align: center;
            z-index: 1;
        }
        
        .stand-shout {
            font-family: var(--font-heading);
            font-size: 2.5rem;
            margin-top: 20px;
            color: var(--secondary-color);
            transform: rotate(-5deg);
            text-shadow: 3px 3px 0 #000;
        }

        .stand-stats-container {
            flex: 1;
            min-width: 300px;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .radar-wrapper {
            width: 320px;
            height: 320px;
        }

        .stand-ability {
            margin-top: 30px;
            background: rgba(255, 255, 255, 0.05);
            padding: 20px;
            border-left: 6px solid var(--accent-color);
            position: relative;
        }

        .ability-title {
            color: var(--accent-color);
            margin-bottom: 15px;
            font-size: 1.8rem;
            text-align: left;
            border-bottom: 1px dashed rgba(255,255,255,0.2);
            padding-bottom: 10px;
        }
        
        .bracket {
            color: var(--primary-color);
        }

        .stand-ability p {
            font-size: 1.1rem;
            line-height: 1.8;
            color: #eee;
            text-align: justify;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .stand-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            animation: fadeIn 1s ease;
        }

        .generating-hint {
            margin-top: 10px;
            color: var(--primary-color);
            font-size: 0.8rem;
            animation: pulse 1s infinite;
        }

        @keyframes pulse {
            from { opacity: 0.6; }
            to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default StandCard;
