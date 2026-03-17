import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Info } from 'lucide-react';

interface PanoramaViewerProps {
  before: string;
  after: string;
  onClose: () => void;
}

export const PanoramaViewer: React.FC<PanoramaViewerProps> = ({ before, after, onClose }) => {
  const [sliderPos, setSliderPos] = useState(50);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const position = ((x - rect.left) / rect.width) * 100;
    setSliderPos(Math.min(Math.max(position, 0), 100));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4 md:p-12"
    >
      <div className="relative w-full max-w-6xl aspect-video bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors"
        >
          <X size={24} />
        </button>

        <div 
          className="relative w-full h-full cursor-ew-resize select-none"
          onMouseMove={handleMouseMove}
          onTouchMove={handleMouseMove}
        >
          {/* Before Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${before})` }}
          >
            <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-md text-sm font-medium backdrop-blur-md">
              BEFORE (Original)
            </div>
          </div>

          {/* After Image (Clipped) */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${after})`,
              clipPath: `inset(0 ${100 - sliderPos}% 0 0)`
            }}
          >
            <div className="absolute top-4 right-4 bg-emerald-600/80 text-white px-3 py-1 rounded-md text-sm font-medium backdrop-blur-md">
              AFTER (AI Enhanced)
            </div>
          </div>

          {/* Slider Line */}
          <div 
            className="absolute top-0 bottom-0 w-1 bg-white z-10 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-emerald-500">
              <div className="flex gap-1">
                <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                <div className="w-1 h-4 bg-emerald-500 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
          <div className="flex items-center gap-2 text-xs opacity-70 mb-1">
            <Info size={14} />
            <span>Technical Transparency</span>
          </div>
          <p className="text-sm font-light">
            This visualization uses <span className="font-bold text-emerald-400">Stable Diffusion</span> to simulate urban greening outcomes. 
            The "After" view represents a potential implementation of the E-type strategy for this specific street segment.
          </p>
        </div>
      </div>
    </motion.div>
  );
};
