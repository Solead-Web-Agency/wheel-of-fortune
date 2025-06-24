import { useState } from 'react'
import WheelOfFortune from './WheelOfFortune'
import { WheelSegment } from './props/WheelSegment'
import './index.css'

const segments: WheelSegment[] = [
  { id: 1, title: "🎁 Prix 1", color: "#C41E3A", textColor: "#FFFFFF" },
  { id: 2, title: "💰 100€", color: "#FFFFFF", textColor: "#000000" },
  { id: 3, title: "🎊 Prix 2", color: "#FFD700", textColor: "#000000" },
  { id: 4, title: "🔥 Bonus", color: "#FF6B35", textColor: "#FFFFFF" },
  { id: 5, title: "⭐ 50€", color: "#4CAF50", textColor: "#FFFFFF" },
  { id: 6, title: "🎯 Spécial", color: "#9C27B0", textColor: "#FFFFFF" },
  { id: 7, title: "💎 200€", color: "#2196F3", textColor: "#FFFFFF" },
  { id: 8, title: "🏆 Jackpot", color: "#FF9800", textColor: "#000000" },
];

function App() {
  const [spinning, setSpinning] = useState(false);
  const [resetting, setResetting] = useState<boolean>(false);
  const [targetSegmentId, setTargetSegmentId] = useState<number | undefined>();
  const [winner, setWinner] = useState<WheelSegment | null>(null);

  const spinWheel = () => {
    if (spinning || resetting) return;
    
    // Choisir un segment aléatoire
    const targetId = Math.floor(Math.random() * segments.length) + 1;
    setTargetSegmentId(targetId);
    setSpinning(true);
    setWinner(null);
  };

  const onStop = () => {
    setSpinning(false);
    if (targetSegmentId) {
      const winningSegment = segments.find(seg => seg.id === targetSegmentId);
      setWinner(winningSegment || null);
    }
  }

  const resetWheel = () => {
    setResetting(true);
    setWinner(null);
    setTargetSegmentId(undefined);
    setTimeout(() => {
      setResetting(false);
    }, 2000);
  }

  return (
    <div className="app-container">
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 className="title">
          🎡 Roue de la Fortune
        </h1>
        <p className="subtitle">
          Cliquez sur "Faire tourner" pour tenter votre chance !
        </p>
      </div>

      <div className="wheel-container">
        <WheelOfFortune
          className="wheel-component"
          segments={segments}
          spinning={spinning}
          targetSegementId={targetSegmentId}
          onStop={onStop}
          onReset={setResetting}
          spinDuration={4000}
          resetDuration={2000}
        />
      </div>

      <div className="buttons-container">
        <div className="buttons-row">
          <button 
            onClick={spinWheel}
            disabled={spinning || resetting}
            className="spin-button"
          >
            {spinning ? "🎯 En cours..." : "🎲 Faire tourner"}
          </button>
          
          <button 
            onClick={resetWheel}
            disabled={spinning || resetting}
            className="reset-button"
          >
            {resetting ? "🔄 Reset..." : "🔄 Reset"}
          </button>
        </div>

        {winner && (
          <div className="winner-announcement">
            <h2 className="winner-title">🎉 Félicitations !</h2>
            <p className="winner-text">
              Vous avez gagné : {winner.title}
            </p>
          </div>
        )}
      </div>

      <div className="footer">
        <p>Composant Wheel of Fortune - Démonstration</p>
      </div>
    </div>
  )
}

export default App 