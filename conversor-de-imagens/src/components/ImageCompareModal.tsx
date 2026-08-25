import React, { useState } from 'react';
import { ImageItem } from '../types';
import { X, Download, Copy, Check, Eye, ArrowLeftRight, Percent } from 'lucide-react';
import { formatBytes, getFormatLabel } from '../utils/formatters';

interface ImageCompareModalProps {
  item: ImageItem | null;
  onClose: () => void;
  onDownload: (item: ImageItem) => void;
}

export const ImageCompareModal: React.FC<ImageCompareModalProps> = ({ item, onClose, onDownload }) => {
  const [copied, setCopied] = useState(false);
  const [sliderPos, setSliderPos] = useState(50); // Split slider percentage (0 to 100)

  if (!item || !item.result) return null;

  const originalSize = item.originalSize;
  const resultSize = item.result.fileSize;
  const savingsBytes = originalSize - resultSize;
  const savingsPct = Math.round((savingsBytes / originalSize) * 100);

  const handleCopyClipboard = async () => {
    try {
      if (item.result?.blob) {
        // Chromium supports PNG in clipboard
        if (item.result.format === 'image/png') {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': item.result.blob })
          ]);
        } else {
          // Convert to canvas blob png to copy
          const img = new Image();
          img.src = item.result.dataUrl;
          await new Promise((res) => (img.onload = res));
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);
          canvas.toBlob(async (blob) => {
            if (blob) {
              await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            }
          }, 'image/png');
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Erro ao copiar imagem:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3 truncate">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
              <Eye className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h3 className="font-bold text-base truncate">{item.originalName}</h3>
              <p className="text-xs text-slate-400">Comparação de Qualidade e Tamanho</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Header Bar */}
        <div className="bg-slate-800/80 px-4 sm:px-6 py-3 border-b border-slate-700/60 grid grid-cols-2 sm:grid-cols-3 gap-4 text-center text-xs">
          <div className="border-r border-slate-700/60 pr-2">
            <span className="text-slate-400 block mb-0.5">Original</span>
            <span className="font-bold text-slate-200">{formatBytes(originalSize)}</span>
            <span className="text-[10px] text-slate-400 block">{item.originalWidth}×{item.originalHeight}px ({getFormatLabel(item.originalFormat)})</span>
          </div>

          <div className="border-r border-slate-700/60 sm:border-r pr-2">
            <span className="text-slate-400 block mb-0.5">Convertida</span>
            <span className="font-bold text-emerald-400">{formatBytes(resultSize)}</span>
            <span className="text-[10px] text-slate-400 block">{item.result.width}×{item.result.height}px ({getFormatLabel(item.result.format)})</span>
          </div>

          <div className="col-span-2 sm:col-span-1 flex items-center justify-center">
            <div className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1 ${
              savingsBytes > 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-700 text-slate-300'
            }`}>
              <Percent className="w-3.5 h-3.5 mr-1" />
              <span>{savingsBytes > 0 ? `${savingsPct}% menor (${formatBytes(savingsBytes)} economizados)` : 'Mesmo Tamanho'}</span>
            </div>
          </div>
        </div>

        {/* Split Preview Area */}
        <div className="flex-1 min-h-[300px] sm:min-h-[400px] relative bg-slate-950 flex items-center justify-center overflow-hidden select-none p-4">
          <div className="relative max-w-full max-h-[500px] overflow-hidden rounded-xl border border-slate-800 shadow-2xl flex items-center justify-center">
            
            {/* Background Image (Converted) */}
            <img
              src={item.result.dataUrl}
              alt="Convertida"
              className="max-h-[460px] w-auto object-contain block pointer-events-none"
            />

            {/* Foreground Clipped Image (Original) */}
            <div
              className="absolute inset-0 overflow-hidden border-r-2 border-blue-500 shadow-2xl"
              style={{ width: `${sliderPos}%` }}
            >
              <img
                src={item.originalDataUrl}
                alt="Original"
                className="max-h-[460px] w-auto object-contain block pointer-events-none max-w-none"
                style={{ width: '100%', height: '100%' }}
              />
              <span className="absolute top-3 left-3 bg-slate-900/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow">
                ORIGINAL
              </span>
            </div>

            <span className="absolute top-3 right-3 bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow">
              CONVERTIDA
            </span>

            {/* Slider Control Handle */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-blue-500 cursor-ew-resize flex items-center justify-center group"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg transform -translate-x-1/2 border-2 border-white group-hover:scale-110 transition-transform">
                <ArrowLeftRight className="w-4 h-4" />
              </div>
            </div>

            {/* Invisible Range Input Overlay */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPos}
              onChange={(e) => setSliderPos(parseFloat(e.target.value))}
              className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-10"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            Arraste a linha central para comparar os detalhes de nitidez da imagem.
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleCopyClipboard}
              className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 mr-1.5 text-emerald-400" /> : <Copy className="w-4 h-4 mr-1.5" />}
              {copied ? 'Copiada!' : 'Copiar Imagem'}
            </button>

            <button
              onClick={() => onDownload(item)}
              className="inline-flex items-center px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all"
            >
              <Download className="w-4 h-4 mr-1.5" />
              Baixar Imagem
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
