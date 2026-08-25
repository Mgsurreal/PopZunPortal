import React, { useState } from 'react';
import { ImageItem, ImageAdjustments, CropArea } from '../types';
import { X, RotateCw, RotateCcw, FlipHorizontal, FlipVertical, Sliders, Check, RefreshCw, Crop } from 'lucide-react';

interface ImageEditorModalProps {
  item: ImageItem | null;
  onClose: () => void;
  onSave: (id: string, adjustments: ImageAdjustments, crop?: CropArea) => void;
}

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({ item, onClose, onSave }) => {
  if (!item) return null;

  const [adjustments, setAdjustments] = useState<ImageAdjustments>({
    rotation: item.adjustments?.rotation || 0,
    flipH: item.adjustments?.flipH || false,
    flipV: item.adjustments?.flipV || false,
    brightness: item.adjustments?.brightness || 100,
    contrast: item.adjustments?.contrast || 100,
    saturation: item.adjustments?.saturation || 100,
  });

  const handleRotateCW = () => {
    setAdjustments((prev) => ({ ...prev, rotation: (prev.rotation + 90) % 360 }));
  };

  const handleRotateCCW = () => {
    setAdjustments((prev) => ({ ...prev, rotation: (prev.rotation + 270) % 360 }));
  };

  const handleFlipH = () => {
    setAdjustments((prev) => ({ ...prev, flipH: !prev.flipH }));
  };

  const handleFlipV = () => {
    setAdjustments((prev) => ({ ...prev, flipV: !prev.flipV }));
  };

  const handleReset = () => {
    setAdjustments({
      rotation: 0,
      flipH: false,
      flipV: false,
      brightness: 100,
      contrast: 100,
      saturation: 100,
    });
  };

  const handleSave = () => {
    onSave(item.id, adjustments);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3 truncate">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <Sliders className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h3 className="font-bold text-base truncate">Editar e Ajustar: {item.originalName}</h3>
              <p className="text-xs text-slate-400">Gire, espelhe e ajuste o brilho antes de converter</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview Canvas / Container */}
        <div className="bg-slate-950 p-6 flex items-center justify-center min-h-[300px] max-h-[420px] overflow-hidden select-none relative">
          <div className="relative max-w-full max-h-[380px] flex items-center justify-center">
            <img
              src={item.originalDataUrl}
              alt="Pré-visualização"
              className="max-h-[360px] w-auto object-contain transition-transform duration-200"
              style={{
                transform: `rotate(${adjustments.rotation}deg) scaleX(${adjustments.flipH ? -1 : 1}) scaleY(${adjustments.flipV ? -1 : 1})`,
                filter: `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%)`,
              }}
            />
          </div>
        </div>

        {/* Controls Panel */}
        <div className="p-5 space-y-5 bg-slate-900 border-t border-slate-800">
          
          {/* Quick Rotation & Flip Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-400 mr-2">Orientação:</span>
              <button
                onClick={handleRotateCCW}
                className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-medium flex items-center space-x-1"
                title="Girar 90° Anti-horário"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">-90°</span>
              </button>

              <button
                onClick={handleRotateCW}
                className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-medium flex items-center space-x-1"
                title="Girar 90° Horário"
              >
                <RotateCw className="w-4 h-4" />
                <span className="hidden sm:inline">+90°</span>
              </button>

              <div className="h-4 w-px bg-slate-700 mx-1" />

              <button
                onClick={handleFlipH}
                className={`p-2 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors ${
                  adjustments.flipH ? 'bg-indigo-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                }`}
                title="Espelhar Horizontamente"
              >
                <FlipHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Flip H</span>
              </button>

              <button
                onClick={handleFlipV}
                className={`p-2 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors ${
                  adjustments.flipV ? 'bg-indigo-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                }`}
                title="Espelhar Verticalmente"
              >
                <FlipVertical className="w-4 h-4" />
                <span className="hidden sm:inline">Flip V</span>
              </button>
            </div>

            <button
              onClick={handleReset}
              className="text-xs font-medium text-rose-400 hover:text-rose-300 flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-800"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Resetar Ajustes</span>
            </button>
          </div>

          {/* Sliders: Brightness, Contrast, Saturation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-300">Brilho</span>
                <span className="text-indigo-400 font-mono">{adjustments.brightness}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                value={adjustments.brightness}
                onChange={(e) => setAdjustments({ ...adjustments, brightness: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-300">Contraste</span>
                <span className="text-indigo-400 font-mono">{adjustments.contrast}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                value={adjustments.contrast}
                onChange={(e) => setAdjustments({ ...adjustments, contrast: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-300">Saturação</span>
                <span className="text-indigo-400 font-mono">{adjustments.saturation}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={adjustments.saturation}
                onChange={(e) => setAdjustments({ ...adjustments, saturation: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>

        </div>

        {/* Actions Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancelar
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all flex items-center space-x-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Aplicar Ajustes e Reconverter</span>
          </button>
        </div>

      </div>
    </div>
  );
};
