import { useState, useEffect, useRef } from 'react'
import './index.css'

// Types pour la gestion des lots
interface WheelSegment {
  id: number;
  title: string;
  color: string;
  textColor: string;
  stock: number;
  stockParJour: number;
  type: 'lot' | 'defaite' | 'bonus';
  image?: string; // URL de l'image pour le segment
  resultImage?: string; // URL de l'image pour l'affichage du résultat
}

interface StockManager {
  jour: number; // 1 ou 2
  lotsDistribuesAujourdhui: { [key: number]: number };
  totalDistribue: { [key: number]: number };
}

type Festival = 'francofolies' | 'goldencoast';

// Configuration des festivals
const festivalConfigs = {
  francofolies: {
    name: "Francofolies",
    colors: {
      primary: "#C41E3A",
      secondary: "#2196F3", 
      accent: "#FFD700",
      bonus: "#FF6B35"
    },
    segments: [
      { id: 1, title: "chapeau Bob", color: "#C41E3A", textColor: "#FFFFFF", stock: 3000, stockParJour: 1500, type: 'lot' as const },
      { id: 2, title: "Brumisateur", color: "#2196F3", textColor: "#FFFFFF", stock: 700, stockParJour: 350, type: 'lot' as const },
      { id: 3, title: "Bananes", color: "#FFD700", textColor: "#000000", stock: 600, stockParJour: 300, type: 'lot' as const },
      { id: 4, title: "✨ BONUS", color: "#FF6B35", textColor: "#FFFFFF", stock: 999999, stockParJour: 999999, type: 'bonus' as const },
    ]
  },
  goldencoast: {
    name: "Golden Coast",
    colors: {
      primary: "#FF8C00",
      secondary: "#32CD32",
      accent: "#FFD700", 
      bonus: "#FF6B35"
    },
    segments: [
      { id: 1, title: "chapeau Bob", color: "#FF8C00", textColor: "#FFFFFF", stock: 3000, stockParJour: 1500, type: 'lot' as const },
      { id: 2, title: "Brumisateur", color: "#32CD32", textColor: "#FFFFFF", stock: 700, stockParJour: 350, type: 'lot' as const },
      { id: 3, title: "Bananes", color: "#FFD700", textColor: "#000000", stock: 600, stockParJour: 300, type: 'lot' as const },
      { id: 4, title: "✨ BONUS", color: "#FF6B35", textColor: "#FFFFFF", stock: 999999, stockParJour: 999999, type: 'bonus' as const },
    ]
  }
};

// Composant roue segmentée pour tablette
function SegmentedWheel({ segments, rotationAngle, festival }: {
  segments: WheelSegment[];
  rotationAngle: number;
  festival: Festival;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const config = festivalConfigs[festival];



  // Fonction pour dessiner du texte courbé le long d'un arc (améliorée)
  const drawCurvedText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, startAngle: number, textRadius: number) => {
    // Ajustements selon la longueur du texte
    const isLongText = text.length > 8;
    const adjustedRadius = isLongText ? textRadius * 0.9 : textRadius; // Rapprocher du centre pour les textes longs
    
    // Espacement plus serré pour tous les textes
    const spacingMultiplier = isLongText ? 0.7 : 0.5; // Resserrer davantage les caractères
    
    // Calculer l'espacement optimal entre les caractères
    const totalChars = text.length;
    const segmentAngleRad = (115 * Math.PI) / 180; // 115° en radians pour les segments principaux
    const availableAngle = segmentAngleRad * 0.6; // Utiliser 60% de l'angle du segment (réduit de 70%)
    const anglePerChar = availableAngle / totalChars * spacingMultiplier;
    
    // Commencer l'angle pour centrer le texte
    let currentAngle = startAngle - (anglePerChar * (totalChars - 1)) / 2;
    
    // Dessiner chaque caractère individuellement
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(currentAngle);
      ctx.translate(adjustedRadius, 0);
      ctx.rotate(Math.PI / 2); // Orienter le caractère perpendiculairement au rayon
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(char, 0, 0);
      ctx.restore();
      
      // Avancer à la position du caractère suivant
      currentAngle += anglePerChar;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const size = 400;
    canvas.width = size;
    canvas.height = size;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 180;

    // Sauvegarder le contexte et appliquer la rotation
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((rotationAngle * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);

    // Dessiner les segments avec tailles personnalisées
    // 3 segments de 115° + 1 bonus de 15° (plus visible)
    const segmentAngles = [115, 115, 115, 15]; // en degrés
    let currentAngle = -90; // Commencer en haut
    
    segments.forEach((segment, index) => {
      const segmentAngleDegrees = segmentAngles[index];
      const segmentAngleRadians = (segmentAngleDegrees * Math.PI) / 180;
      
      const startAngle = (currentAngle * Math.PI) / 180;
      const endAngle = startAngle + segmentAngleRadians;

      // Dessiner le segment
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = segment.color;
      ctx.fill();
      
      // Bordure du segment (plus fine)
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Texte du segment - courbé pour tous les lots, droit pour le bonus
      ctx.fillStyle = segment.textColor;
      
      if (segment.type === 'bonus') {
        ctx.font = "bold 14px Arial";
        // Bonus : texte droit comme avant car la case est trop petite pour le texte courbé
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + segmentAngleRadians / 2);
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(segment.title, radius / 2.5, 0);
        ctx.restore();
      } else {
        // Ajuster la taille de police selon la longueur du texte
        const isLongText = segment.title.length > 8;
        ctx.font = isLongText ? "bold 14px Arial" : "bold 16px Arial";
        
        // Tous les lots : texte courbé (avec algorithme amélioré)
        drawCurvedText(ctx, segment.title, centerX, centerY, startAngle + segmentAngleRadians / 2, radius * 0.65);
      }
      
      currentAngle += segmentAngleDegrees;
    });

    // Restaurer le contexte
    ctx.restore();

    // Cercle central avec couleur du festival
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = config.colors.accent;
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.stroke();

  }, [segments, rotationAngle, festival]);

  return (
    <div style={{ 
      width: '400px', 
      height: '400px', 
      margin: '20px auto',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Flèche indicatrice fixe avec couleur du festival */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '0',
        height: '0',
        borderLeft: '20px solid transparent',
        borderRight: '20px solid transparent',
        borderTop: `30px solid ${config.colors.primary}`,
        zIndex: 10,
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
      }} />
      
      {/* Canvas de la roue */}
      <canvas
        ref={canvasRef}
        style={{
          border: `8px solid ${config.colors.accent}`,
          borderRadius: '50%',
          boxShadow: `0 0 30px ${config.colors.accent}60`,
          cursor: 'pointer'
        }}
      />
      

    </div>
  );
}

function App() {
  const [festival, setFestival] = useState<Festival>('francofolies');
  const [segments, setSegments] = useState<WheelSegment[]>(festivalConfigs.francofolies.segments);

  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<WheelSegment | null>(null);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [jour, setJour] = useState(1); // Jour 1 ou 2
  const [stockManager, setStockManager] = useState<StockManager>({
    jour: 1,
    lotsDistribuesAujourdhui: {},
    totalDistribue: {}
  });
  const [showBonusPopup, setShowBonusPopup] = useState(false);
  const [showWinnerPopup, setShowWinnerPopup] = useState(false);
  
  // Mode admin caché
  const [showAdminInterface, setShowAdminInterface] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fonction pour gérer les clics dans le coin supérieur droit
  const handleCornerClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    // Reset du compteur après 2 secondes d'inactivité
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    clickTimeoutRef.current = setTimeout(() => {
      setClickCount(0);
    }, 2000);
    
    // Toggle le mode admin après 4 clics
    if (newCount >= 4) {
      setShowAdminInterface(!showAdminInterface);
      setClickCount(0);
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    }
  };

  // Changer de festival
  const changerFestival = (nouveauFestival: Festival) => {
    setFestival(nouveauFestival);
    setSegments(festivalConfigs[nouveauFestival].segments);
    setResult(null);
    setRotationAngle(0);
    
    // Charger les données spécifiques au festival
    const savedData = localStorage.getItem(`festival-wheel-data-${nouveauFestival}`);
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setStockManager(data.stockManager || { jour: 1, lotsDistribuesAujourdhui: {}, totalDistribue: {} });
        setJour(data.jour || 1);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setStockManager({ jour: 1, lotsDistribuesAujourdhui: {}, totalDistribue: {} });
        setJour(1);
      }
    } else {
      // Nouveau festival, reset
      setStockManager({ jour: 1, lotsDistribuesAujourdhui: {}, totalDistribue: {} });
      setJour(1);
    }
  };

  // Charger les données sauvegardées
  useEffect(() => {
    const saved = localStorage.getItem(`festival-wheel-data-${festival}`);
    if (saved) {
      const data = JSON.parse(saved);
      setStockManager(data.stockManager || { jour: 1, lotsDistribuesAujourdhui: {}, totalDistribue: {} });
      setJour(data.jour || 1);
    }
  }, []);

  // Sauvegarder les données
  const saveData = (newStockManager: StockManager, newJour: number) => {
    const data = { stockManager: newStockManager, jour: newJour };
    localStorage.setItem(`festival-wheel-data-${festival}`, JSON.stringify(data));
  };

  // Logique de tirage - 33% pour chaque lot principal + 1% bonus
  const spinWheel = () => {
    if (spinning) return;
    
    console.log(`🎪 Jour ${jour} - Tirage en cours...`);
    setSpinning(true);
    setResult(null);
    
    const randomValue = Math.random();
    let selectedSegment: WheelSegment;
    
    // 1% de chance pour le bonus
    if (randomValue < 0.01) {
      selectedSegment = segments[3]; // Bonus
      console.log("🌟 BONUS RARE DÉCLENCHÉ ! (1%)");
    } else {
      // 99% restants répartis sur les 3 lots principaux (33% chacun)
      const adjustedRandom = (randomValue - 0.01) / 0.99; // Normaliser sur les 99% restants
      
      // Vérifier les stocks disponibles pour les lots principaux
      const lotsDisponibles = segments.slice(0, 3).filter(segment => {
        const distribueAujourdhui = stockManager.lotsDistribuesAujourdhui[segment.id] || 0;
        return distribueAujourdhui < segment.stockParJour;
      });

      if (lotsDisponibles.length === 0) {
        // Plus de lots disponibles - forcer le bonus
        selectedSegment = segments[3]; // Bonus
        console.log("⚠️ Plus de stocks disponibles, attribution du bonus");
      } else {
        // Distribution équitable sur les lots disponibles
        if (adjustedRandom < 0.333) {
          // 33% - Bobs (si disponible)
          selectedSegment = lotsDisponibles.find(s => s.id === 1) || lotsDisponibles[0];
        } else if (adjustedRandom < 0.666) {
          // 33% - Brumisateur (si disponible)  
          selectedSegment = lotsDisponibles.find(s => s.id === 2) || lotsDisponibles[0];
        } else {
          // 33% - Bananes (si disponible)
          selectedSegment = lotsDisponibles.find(s => s.id === 3) || lotsDisponibles[0];
        }
      }
    }

    // Calculer l'angle pour que la flèche pointe exactement sur le segment choisi
    const segmentIndex = segments.findIndex(s => s.id === selectedSegment.id);
    
    // Angles personnalisés pour chaque segment (bonus plus petit)
    let targetAngleForFlèche: number;
    if (segmentIndex === 0) { // Bobs
      targetAngleForFlèche = 59.5; // Centre du segment Bobs (119°)
    } else if (segmentIndex === 1) { // Brumisateur  
      targetAngleForFlèche = 178.5; // Centre du segment Brumisateur (119°)
    } else if (segmentIndex === 2) { // Bananes
      targetAngleForFlèche = 297.5; // Centre du segment Bananes (119°)
         } else { // Bonus
       targetAngleForFlèche = 352.5; // Centre du segment Bonus (15°)
     }
    
    // L'angle de rotation nécessaire pour amener le segment sous la flèche
    const rotationNeeded = -targetAngleForFlèche;
    const totalRotation = 360 * 3 + rotationNeeded; // 3 tours + rotation finale

    console.log(`🎯 Segment choisi: ${selectedSegment.title} (index: ${segmentIndex})`);
    console.log(`🎯 Probabilité: ${(randomValue * 100).toFixed(1)}%`);
    console.log(`🎯 Angle cible: ${targetAngleForFlèche}°`);

    // Animation fluide
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / 3000, 1);
      
      // Fonction d'easing pour ralentissement naturel
      const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
      const currentRotation = easeOut(progress) * totalRotation;
      
      setRotationAngle(currentRotation);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Fin de l'animation
        setTimeout(() => {
          // Mettre à jour les stocks (sauf pour bonus)
          if (selectedSegment.type !== 'bonus') {
            const newStockManager = {
              ...stockManager,
              lotsDistribuesAujourdhui: {
                ...stockManager.lotsDistribuesAujourdhui,
                [selectedSegment.id]: (stockManager.lotsDistribuesAujourdhui[selectedSegment.id] || 0) + 1
              },
              totalDistribue: {
                ...stockManager.totalDistribue,
                [selectedSegment.id]: (stockManager.totalDistribue[selectedSegment.id] || 0) + 1
              }
            };
            setStockManager(newStockManager);
            saveData(newStockManager, jour);
          }
          
          setResult(selectedSegment);
          setSpinning(false);
          
          // Afficher popup selon le type de résultat
          if (selectedSegment.type === 'bonus') {
            setShowBonusPopup(true);
          } else if (selectedSegment.type === 'lot') {
            setShowWinnerPopup(true);
          }
          
          console.log(`🏆 Résultat final: ${selectedSegment.title}`);
        }, 500);
      }
    };
    
    requestAnimationFrame(animate);
  };

  // Changer de jour
  const changerJour = (nouveauJour: number) => {
    const newStockManager = {
      ...stockManager,
      jour: nouveauJour,
      lotsDistribuesAujourdhui: nouveauJour !== jour ? {} : stockManager.lotsDistribuesAujourdhui
    };
    setStockManager(newStockManager);
    setJour(nouveauJour);
    setResult(null);
    setShowWinnerPopup(false);
    setShowBonusPopup(false);
    saveData(newStockManager, nouveauJour);
  };

  // Reset complet
  const resetComplet = () => {
    const newStockManager = { jour: 1, lotsDistribuesAujourdhui: {}, totalDistribue: {} };
    setStockManager(newStockManager);
    setJour(1);
    setResult(null);
    setRotationAngle(0);
    setShowWinnerPopup(false);
    setShowBonusPopup(false);
    localStorage.removeItem(`festival-wheel-data-${festival}`);
    console.log(`🔄 Reset complet effectué pour ${festivalConfigs[festival].name}`);
  };

  return (
    <div className="app-container" style={{ padding: '1rem', position: 'relative' }}>
      {/* Zone cliquable invisible pour activer le mode admin */}
      <div 
        onClick={handleCornerClick}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '60px',
          height: '60px',
          cursor: 'pointer',
          zIndex: 1000,
          // Indicateur visuel subtil du nombre de clics
          background: clickCount > 0 ? `rgba(255, 255, 255, ${clickCount * 0.1})` : 'transparent',
          borderRadius: '0 0 0 50px'
        }}
                 title={`${clickCount}/4 clics pour ${showAdminInterface ? 'masquer' : 'activer'} le mode admin`}
      />
      
      {/* Titre principal en haut */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 className="title" style={{ 
          fontSize: '3.5rem', 
          marginBottom: '0.5rem',
          lineHeight: '1.2',
          fontFamily: 'Impact, "Arial Black", "Franklin Gothic Bold", sans-serif',
          fontWeight: '900',
          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 25%, #FFD700 50%, #FFFF00 75%, #FFD700 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow: '2px 2px 8px rgba(255, 215, 0, 0.5), 0 0 20px rgba(255, 215, 0, 0.3)',
          filter: 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))',
          letterSpacing: '2px',
          textTransform: 'uppercase'
        }}>
          Roue des Gagnants
        </h1>
      </div>

      {/* Layout principal en 3 colonnes */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 400px 1fr',
        gap: '2rem',
        alignItems: 'center',
        minHeight: '450px',
        marginBottom: '2rem'
      }}>
        
        {/* Colonne gauche - Logo France TV */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img 
            src="/francetv.png" 
            alt="France TV" 
            style={{ 
              height: '100px',
              objectFit: 'contain'
            }} 
          />
        </div>

        {/* Colonne centrale - Roue avec bouton superposé */}
        <div className="wheel-container" style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          position: 'relative'
        }}>
          {/* Filtre sur la roue quand elle n'est pas en train de tourner */}
          <div style={{
            position: 'relative',
            filter: !spinning ? 'brightness(0.7) blur(1px)' : 'none',
            transition: 'filter 0.3s ease'
          }}>
            <SegmentedWheel
              segments={segments}
              rotationAngle={rotationAngle}
              festival={festival}
            />
          </div>
          
          {/* Bouton centré sur la roue */}
          {!spinning && (
            <button 
              onClick={spinWheel}
              className="spin-button"
              style={{ 
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '1.1rem',
                padding: '15px 25px',
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF6B35 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 215, 0, 0.5)',
                zIndex: 10,
                transition: 'all 0.3s ease',
                textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)',
                minWidth: '180px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.1)';
                e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.4), 0 0 30px rgba(255, 215, 0, 0.8)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 215, 0, 0.5)';
              }}
            >
              🎲 LANCER LA ROUE
            </button>
          )}
          
          {/* Message pendant le tirage */}
          {spinning && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '15px 25px',
              borderRadius: '25px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              zIndex: 10,
              textAlign: 'center',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.5)',
              animation: 'pulse 1.5s infinite'
            }}>
              🎯 Tirage en cours...
            </div>
          )}
        </div>

        {/* Colonne droite - Logo Festival */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem'
        }}>
          {/* Logo du festival actuel */}
          <img 
            src={`/${festival}.png`}
            alt={festivalConfigs[festival].name}
            style={{ 
              height: '120px',
              objectFit: 'contain',
              maxWidth: '250px'
            }} 
          />

          {/* Sélecteur de Festival - Mode Admin uniquement */}
          {showAdminInterface && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <button 
                onClick={() => changerFestival('francofolies')}
                style={{
                  background: festival === 'francofolies' 
                    ? `linear-gradient(135deg, ${festivalConfigs.francofolies.colors.primary}, ${festivalConfigs.francofolies.colors.secondary})`
                    : 'linear-gradient(to right, #666, #888)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 25px',
                  borderRadius: '25px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  boxShadow: festival === 'francofolies' ? '0 4px 15px rgba(196, 30, 58, 0.4)' : 'none',
                  transform: festival === 'francofolies' ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.3s ease'
                }}
              >
                🎵 Francofolies
              </button>
              <button 
                onClick={() => changerFestival('goldencoast')}
                style={{
                  background: festival === 'goldencoast' 
                    ? `linear-gradient(135deg, ${festivalConfigs.goldencoast.colors.primary}, ${festivalConfigs.goldencoast.colors.secondary})`
                    : 'linear-gradient(to right, #666, #888)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 25px',
                  borderRadius: '25px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  boxShadow: festival === 'goldencoast' ? '0 4px 15px rgba(255, 140, 0, 0.4)' : 'none',
                  transform: festival === 'goldencoast' ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.3s ease'
                }}
              >
                🏖️ Golden Coast
              </button>
            </div>
          )}

          {/* Sélecteur de jour - Mode Admin uniquement */}
          {showAdminInterface && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                onClick={() => changerJour(1)}
                style={{
                  background: jour === 1 ? 'linear-gradient(to right, #FFD700, #FFA500)' : 'linear-gradient(to right, #666, #888)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '25px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                📅 Jour 1
              </button>
              <button 
                onClick={() => changerJour(2)}
                style={{
                  background: jour === 2 ? 'linear-gradient(to right, #FFD700, #FFA500)' : 'linear-gradient(to right, #666, #888)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '25px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                📅 Jour 2
              </button>
            </div>
          )}
        </div>
      </div>

      

      {/* Statistiques pour l'admin - Mode Admin uniquement */}
      {showAdminInterface && (
        <div style={{ 
          position: 'fixed', 
          bottom: '10px', 
          right: '10px', 
          background: 'rgba(0,0,0,0.8)', 
          color: 'white', 
          padding: '10px', 
          borderRadius: '10px',
          fontSize: '12px',
          maxWidth: '200px'
        }}>
          <div><strong>📊 Jour {jour}</strong></div>
          {segments.filter(s => s.type === 'lot').map(segment => {
            const distribue = stockManager.lotsDistribuesAujourdhui[segment.id] || 0;
            const restant = segment.stockParJour - distribue;
            // Afficher le titre complet ou le tronquer si trop long
            const displayTitle = segment.title.length > 12 ? segment.title.substring(0, 12) + '...' : segment.title;
            return (
              <div key={segment.id}>
                {displayTitle}: {distribue}/{segment.stockParJour} ({restant} restants)
              </div>
            );
          })}
          <button 
            onClick={resetComplet}
            style={{ 
              background: '#ff4444', 
              color: 'white', 
              border: 'none', 
              padding: '5px 10px', 
              borderRadius: '5px', 
              fontSize: '10px',
              marginTop: '10px',
              cursor: 'pointer'
            }}
          >
            🔄 Reset
          </button>
          
          {/* Bouton pour masquer le mode admin */}
          <button 
            onClick={() => setShowAdminInterface(false)}
            style={{ 
              background: '#333', 
              color: 'white', 
              border: 'none', 
              padding: '5px 10px', 
              borderRadius: '5px', 
              fontSize: '10px',
              marginTop: '5px',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            👁️ Masquer Admin
          </button>
        </div>
      )}

      {/* Popup Félicitations */}
      {showWinnerPopup && result && result.type === 'lot' && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          background: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: `linear-gradient(135deg, ${festivalConfigs[festival].colors.primary}, ${festivalConfigs[festival].colors.secondary})`,
            padding: '40px',
            borderRadius: '20px',
            textAlign: 'center',
            color: 'white',
            maxWidth: '500px',
            margin: '20px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>🎉</div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
              FÉLICITATIONS !
            </h2>
            <p style={{ fontSize: '1.3rem', marginBottom: '30px', lineHeight: '1.5' }}>
              Bravo ! Vous avez gagné :
            </p>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '25px',
              borderRadius: '15px',
              marginBottom: '30px'
            }}>
              <h3 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '10px' }}>
                🏆 {result.title}
              </h3>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '20px',
              borderRadius: '15px',
              marginBottom: '30px'
            }}>
              <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                💡 Présentez ce résultat au stand pour récupérer votre lot !
              </p>
            </div>
            <button 
              onClick={() => setShowWinnerPopup(false)}
              style={{
                background: 'linear-gradient(to right, #4CAF50, #45a049)',
                color: 'white',
                border: 'none',
                padding: '15px 35px',
                borderRadius: '25px',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
                transition: 'transform 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              J'ai compris !
            </button>
          </div>
        </div>
      )}

      {/* Popup Question Bonus */}
      {showBonusPopup && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          background: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
            padding: '40px',
            borderRadius: '20px',
            textAlign: 'center',
            color: 'white',
            maxWidth: '500px',
            margin: '20px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>✨</div>
            <h2 style={{ fontSize: '2rem', marginBottom: '20px', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
              🎊 QUESTION BONUS ! 🎊
            </h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '30px', lineHeight: '1.5' }}>
              Félicitations ! Vous avez décroché le bonus rare !<br/>
              <strong>(1% de chance seulement !)</strong>
            </p>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '20px',
              borderRadius: '15px',
              marginBottom: '30px'
            }}>
              <h3 style={{ marginBottom: '15px', fontSize: '1.3rem' }}>
                📝 Question Bonus :
              </h3>
              <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                "En quelle année ont eu lieu les premières Francofolies de La Rochelle ?"
              </p>
            </div>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={() => setShowBonusPopup(false)}
                style={{
                  background: 'linear-gradient(to right, #4CAF50, #45a049)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 25px',
                  borderRadius: '25px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                }}
              >
                ✅ Répondre à la question
              </button>
              <button 
                onClick={() => setShowBonusPopup(false)}
                style={{
                  background: 'linear-gradient(to right, #666, #888)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 25px',
                  borderRadius: '25px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                }}
              >
                ❌ Fermer
              </button>
            </div>
            <p style={{ fontSize: '0.9rem', marginTop: '20px', opacity: '0.9' }}>
              💡 Présentez-vous au stand pour répondre et gagner un lot exclusif !
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App
