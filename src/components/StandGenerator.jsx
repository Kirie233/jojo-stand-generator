import React, { useState, useEffect } from 'react';
import InputForm from './InputForm';
import StandCard from './StandCard';
import HistoryList from './HistoryList';
import NavBar from './NavBar';
import DonateModal from './DonateModal';
import HelpModal from './HelpModal';
import { generateStandProfile, generateStandImage, getCachedStand, saveCachedStand } from '../services/gemini';
import { getHistory, addToHistory } from '../services/history';
import '../styles/variables.css';

const StandGenerator = () => {
  const [standData, setStandData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showDonate, setShowDonate] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Load history on mount
  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleGenerate = async (inputs) => {
    setLoading(true);
    setError(null);
    setShowHistory(false);

    // 1. Check Cache
    const cached = getCachedStand(inputs);
    if (cached) {
      setStandData(cached);
      setLoading(false);
      return;
    }

    try {
      // 2. Generate Text Profile
      const data = await generateStandProfile(inputs);
      setStandData({ ...data, userName: inputs.userName }); // Display text immediately while image loads

      // 3. Generate Image (Async)
      if (data.appearance) {
        generateStandImage(data.appearance).then(imageUrl => {
          if (imageUrl) {
            // Keep userName in the final data object
            const fullData = { ...data, imageUrl, userName: inputs.userName };
            // Update state with image
            setStandData(prev => ({ ...prev, imageUrl, userName: inputs.userName }));

            // Save to Cache & History (only on full success)
            saveCachedStand(inputs, fullData);
            const updatedHistory = addToHistory(fullData);
            setHistory(updatedHistory);
          } else {
            // Mark as failed so Card stops loading
            setStandData(prev => ({ ...prev, imageFailed: true }));
          }
        });
      }
    } catch (err) {
      console.error(err);
      setError("替身觉醒失败 (FAILED): " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStandData(null);
    setError(null);
  };

  return (
    <div className="generator-container">
      <NavBar
        onReset={handleReset}
        onToggleHistory={() => setShowHistory(prev => !prev)}
        onToggleDonate={() => setShowDonate(true)}
        onToggleHelp={() => setShowHelp(true)}
      />

      {showDonate && <DonateModal onClose={() => setShowDonate(false)} />}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      {showHistory && (
        <HistoryList
          history={history}
          onClose={() => setShowHistory(false)}
          onLoad={(item) => {
            setStandData(item);
            setShowHistory(false);
          }}
        />
      )}

      <main className="content-area">
        {loading && (
          <div className="loading-state">
            <div className="menacing">ゴ</div>
            <div className="menacing">ゴ</div>
            <div className="menacing">ゴ</div>
            <div className="menacing">ゴ</div>
            <p>觉醒中... AWAKENING</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={() => setError(null)}>重试 (RETRY)</button>
          </div>
        )}

        {!loading && !standData && (
          <div className="intro-area">
            <h1 className="main-title">JOJO替身生成器</h1>
            <p className="subtitle">觉醒你的精神幽波纹</p>
            <InputForm onSubmit={handleGenerate} />
          </div>
        )}

        {!loading && standData && (
          <div className="result-area">
            <StandCard standData={standData} />
            <button className="reset-button" onClick={handleReset}>
              下一位替身使者 (NEXT USER)
            </button>
          </div>
        )}
      </main>

      <style>{`
        .generator-container {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 80px 20px 20px; /* Top padding for fixed navbar */
            text-align: center;
        }

        .main-title {
            font-size: 4rem;
            color: var(--accent-color);
            text-shadow: 4px 4px var(--primary-color);
            margin-bottom: 10px;
            line-height: 1;
        }

        .subtitle {
            color: var(--secondary-color);
            letter-spacing: 5px;
            font-size: 1.2rem;
            margin-bottom: 40px;
            font-weight: bold;
        }

        .loading-state {
            font-size: 3rem;
            color: var(--primary-color);
            animation: pulse 1s infinite alternate;
        }

        .menacing {
            display: inline-block;
            margin: 0 10px;
            animation: shake 0.5s infinite;
        }
        
        .menacing:nth-child(1) { animation-delay: 0s; }
        .menacing:nth-child(2) { animation-delay: 0.1s; }
        .menacing:nth-child(3) { animation-delay: 0.2s; }
        .menacing:nth-child(4) { animation-delay: 0.3s; }

        .error-state {
            color: red;
            background: rgba(255,0,0,0.1);
            padding: 20px;
            border: 1px solid red;
        }

        .reset-button {
            margin-top: 30px;
            background: transparent;
            border: 2px solid var(--text-color);
            color: var(--text-color);
            padding: 10px 30px;
            font-family: var(--font-heading);
            font-size: 1.2rem;
            transition: all 0.3s;
            cursor: pointer;
        }

        .reset-button:hover {
            background: var(--text-color);
            color: var(--bg-color);
        }

        @keyframes shake {
            0% { transform: translate(0, 0) rotate(0deg); }
            25% { transform: translate(2px, 2px) rotate(5deg); }
            50% { transform: translate(0, -2px) rotate(0deg); }
            75% { transform: translate(-2px, 2px) rotate(-5deg); }
            100% { transform: translate(0, 0) rotate(0deg); }
        }
        
        @keyframes pulse {
            from { opacity: 0.6; }
            to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default StandGenerator;
