import React, { useRef, useState, useEffect } from 'react';
import { Eraser } from 'lucide-react';

const SignaturePad = ({ onSave, onCancel }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
    
    // Prevent scrolling on touch
    if (e.touches) e.preventDefault();
  };

  const endDrawing = () => {
    setIsDrawing(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const save = () => {
    const canvas = canvasRef.current;
    // Check if canvas is empty (simplified check)
    // In a real app, you'd check pixel data
    const dataUrl = canvas.toDataURL();
    onSave(dataUrl);
  };

  return (
    <div className="bg-white p-8 border border-premium-gold/30 shadow-2xl">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] mb-6 text-premium-black">Signature Numérique</h3>
      <div className="border border-gray-100 bg-gray-50 mb-6 relative">
        <canvas
          ref={canvasRef}
          width={400}
          height={200}
          className="w-full h-auto cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseOut={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
        />
        <button 
          onClick={clear}
          className="absolute bottom-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
          title="Effacer"
        >
          <Eraser size={16} />
        </button>
      </div>
      <div className="flex gap-4">
        <button 
          onClick={onCancel}
          className="flex-grow py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors"
        >
          Annuler
        </button>
        <button 
          onClick={save}
          className="flex-grow py-3 bg-premium-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-premium-gold transition-all"
        >
          Valider la Signature
        </button>
      </div>
    </div>
  );
};

export default SignaturePad;
