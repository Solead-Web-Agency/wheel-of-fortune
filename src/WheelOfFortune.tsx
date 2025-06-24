import React, { useState, useRef, useEffect } from "react";
import { WheelSegment } from "./props/WheelSegment";

interface SimpleWheelProps {
  segments: WheelSegment[];
  spinning: boolean;
  targetSegementId: number | undefined;
  onStop?: () => void;
  onReset?: (state: boolean) => void;
  spinDuration?: number;
  resetDuration?: number;
  className?: string;
}

const WheelOfFortune: React.FC<SimpleWheelProps> = ({
  segments,
  spinning,
  targetSegementId,
  onStop,
  onReset,
  spinDuration = 4000,
  resetDuration = 2000,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotationAngle, setRotationAngle] = useState(0);

  // Animation de la roue
  useEffect(() => {
    if (spinning && targetSegementId) {
      const segmentAngle = 360 / segments.length;
      const targetAngle = segmentAngle * (segments.length - targetSegementId + 1);
      const totalRotation = 360 * 5 + targetAngle; // 5 tours + position finale
      
      let startTime: number;
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / spinDuration, 1);
        
        // Fonction d'easing pour un ralentissement naturel
        const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
        const currentRotation = easeOut(progress) * totalRotation;
        
        setRotationAngle(currentRotation);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setTimeout(() => {
            onStop?.();
          }, 100);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [spinning, targetSegementId, segments.length, spinDuration, onStop]);

  // Dessin de la roue
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    const size = Math.min(parent?.clientWidth || 400, 400);
    
    canvas.width = size;
    canvas.height = size;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    // Sauvegarder le contexte et appliquer la rotation
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((rotationAngle * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);

    // Dessiner les segments
    const segmentAngle = (2 * Math.PI) / segments.length;
    
    segments.forEach((segment, index) => {
      const startAngle = index * segmentAngle;
      const endAngle = startAngle + segmentAngle;

      // Dessiner le segment
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = segment.color;
      ctx.fill();
      
      // Bordure du segment
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Texte du segment
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + segmentAngle / 2);
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = segment.textColor;
      ctx.font = "bold 16px Arial";
      ctx.fillText(segment.title, radius / 2, 0);
      ctx.restore();
    });

    // Restaurer le contexte
    ctx.restore();

    // Dessiner la flèche au centre
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius);
    ctx.lineTo(centerX - 15, centerY - radius + 30);
    ctx.lineTo(centerX + 15, centerY - radius + 30);
    ctx.closePath();
    ctx.fillStyle = "#FF0000";
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Centre de la roue
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
    ctx.fillStyle = "#FFD700";
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.stroke();

  }, [segments, rotationAngle]);

  return (
    <div className={className} style={{ maxWidth: "400px", margin: "0 auto" }}>
      <canvas
        ref={canvasRef}
        style={{
          border: "3px solid #FFD700",
          borderRadius: "50%",
          display: "block",
          margin: "0 auto",
        }}
      />
    </div>
  );
};

export default WheelOfFortune; 