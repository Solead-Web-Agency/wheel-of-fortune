import { useState } from 'react'
import './index.css'

// Types simples directement dans le fichier
interface WheelSegment {
  id: number;
  title: string;
  color: string;
  textColor: string;
}

// Composant simple intégré
function SimpleWheel({ segments, spinning, targetId, onStop }: {
  segments: WheelSegment[];
  spinning: boolean;
  targetId: number | undefined;
  onStop: () => void;
}) {
  return (
    <div style={{ 
      width: '300px', 
      height: '300px', 
      border: '5px solid #FFD700', 
      borderRadius: '50%', 
      margin: '20px auto',
      background: 'linear-gradient(45deg, #ff6b35, #f7931e, #FFD700, #7fcdcd)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      fontWeight: 'bold',
      color: 'white',
      textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
      animation: spinning ? 'spin 3s ease-out' : 'none',
      cursor: spinning ? 'not-allowed' : 'pointer'
    }}>
      {spinning ? (
        <div style={{ textAlign: 'center' }}>
          <div>🎯</div>
          <div>En cours...</div>
        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div>🎡</div>
          <div>Roue de Fortune</div>
          <div style={{ fontSize: '14px', marginTop: '10px' }}>
            Cliquez "Faire tourner"
          </div>
        </div>
      )}
    </div>
  );
}

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
  const [targetSegmentId, setTargetSegmentId] = useState<number | undefined>();
  const [winner, setWinner] = useState<WheelSegment | null>(null);

  const spinWheel = () => {
    if (spinning) return;
    
    console.log("🎲 Lancement de la roue...");
    
    // Choisir un segment aléatoire
    const targetId = Math.floor(Math.random() * segments.length) + 1;
    const winningSegment = segments.find(seg => seg.id === targetId);
    
    setTargetSegmentId(targetId);
    setSpinning(true);
    setWinner(null);
    
    // Simuler l'animation et arrêt
    setTimeout(() => {
      setSpinning(false);
      setWinner(winningSegment || null);
      console.log("🏆 Gagnant:", winningSegment?.title);
    }, 3000);
  };

  const resetWheel = () => {
    setSpinning(false);
    setWinner(null);
    setTargetSegmentId(undefined);
    console.log("🔄 Roue remise à zéro");
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
        <SimpleWheel
          segments={segments}
          spinning={spinning}
          targetId={targetSegmentId}
          onStop={() => {}}
        />
      </div>

      <div className="buttons-container">
        <div className="buttons-row">
          <button 
            onClick={spinWheel}
            disabled={spinning}
            className="spin-button"
            style={{ opacity: spinning ? 0.5 : 1 }}
          >
            {spinning ? "🎯 En cours..." : "🎲 Faire tourner"}
          </button>
          
          <button 
            onClick={resetWheel}
            disabled={spinning}
            className="reset-button"
            style={{ opacity: spinning ? 0.5 : 1 }}
          >
            🔄 Reset
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
        <p>✅ Version simplifiée - Test de fonctionnement</p>
      </div>
    </div>
  )
}

export default App
