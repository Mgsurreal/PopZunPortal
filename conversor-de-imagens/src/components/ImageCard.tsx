import React, { useState } from 'react';
import { ImageItem, ImageFormat } from '../types';
import { Download, Eye, Sliders, Trash2, Check, RefreshCw, AlertTriangle, Copy, ArrowRight, Sparkles } from 'lucide-react';
import { formatBytes, getFormatLabel, getFileNameWithoutExtension, getFormatExtension } from '../utils/formatters';

interface ImageCardProps {
  item: ImageItem;
  onRemove: (id: string) => void;
  onOpenCompare: (item: ImageItem) => void;
  onOpenEditor: (item: ImageItem) => void;
  onDownload: (item: ImageItem) => void;
  onConvertSingle: (id: string) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({
  item,
  onRemove,
  onOpenCompare,
  onOpenEditor,
  onDownload,
  onConvertSingle,
}) => {
  const [copied, setCopied] = useState(false);

  const isDone = item.status === 'done' && item.result;
  const isProcessing = item.status === 'processing';
  const isError = item.status === 'error';

  let savingsText = '';
  let savingsBytes = 0;
  let savingsPct = 0;

  if (isDone && item.result) {
    savingsBytes = item.originalSize - item.result.fileSize;
    savingsPct = Math.round((savingsBytes / item.originalSize) * 100);
    if (savingsBytes > 0) {
      savingsText = `-${savingsPct}% (${formatBytes(savingsBytes)} menor)`;
    } else if (savingsBytes < 0) {
      savingsText = `+${Math.abs(savingsPct)}% (${formatBytes(Math.abs(savingsBytes))} maior)`;
    } else {
      savingsText = 'Mesmo Tamanho';
    }
  }

  const handleCopy = async () => {
    if (!item.result?.blob) return;
    try {
      if (item.result.format === 'image/png') {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': item.result.blob })
        ]);
      } else {
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
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      
      {/* Left Column: Thumbnail + Details */}
      <div className="flex items-center space-x-4 min-w-0 flex-1">
        
        {/* Thumbnail Preview Container */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center group">
          <img
            src={item.result?.dataUrl || item.originalDataUrl}
            alt={item.originalName}
            className="w-full h-full object-cover"
          />
          
          {/* Format Badge overlay */}
          <div className="absolute bottom-1 left-1 bg-slate-900/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow backdrop-blur-xs">
            {getFormatLabel(item.originalFormat)}
          </div>

          {/* Compare Overlay Icon */}
          {isDone && (
            <button
              onClick={() => onOpenCompare(item)}
              className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
              title="Clique para Comparar"
            >
              <Eye className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* File Infos */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center space-x-2">
            <h4 className="font-bold text-slate-800 text-sm truncate" title={item.originalName}>
              {item.originalName}
            </h4>
          </div>

          {/* Original vs Converted info row */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
            <span>
              Original: <strong className="text-slate-700">{formatBytes(item.originalSize)}</strong> ({item.originalWidth}×{item.originalHeight}px)
            </span>

            {isDone && item.result && (
              <>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-800 font-semibold">
                  {getFormatLabel(item.result.format)}: <strong className="text-blue-600">{formatBytes(item.result.fileSize)}</strong> ({item.result.width}×{item.result.height}px)
                </span>
              </>
            )}
          </div>

          {/* Status & Savings Badges */}
          <div className="pt-1 flex flex-wrap items-center gap-2">
            {isProcessing && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                Convertendo...
              </span>
            )}

            {isDone && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                savingsBytes > 0
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
                <Check className="w-3 h-3 mr-1 text-emerald-600" />
                {savingsText}
              </span>
            )}

            {isError && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                <AlertTriangle className="w-3 h-3 mr-1 text-rose-600" />
                Erro no processamento
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Right Column: Action Buttons */}
      <div className="flex items-center justify-end space-x-2 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
        
        {/* Editor Button */}
        <button
          onClick={() => onOpenEditor(item)}
          className="p-2 text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl transition-colors text-xs font-medium flex items-center space-x-1"
          title="Editar rotação, brilho e ajustes"
        >
          <Sliders className="w-4 h-4" />
          <span className="hidden lg:inline">Ajustar</span>
        </button>

        {/* Compare Button */}
        {isDone && (
          <button
            onClick={() => onOpenCompare(item)}
            className="p-2 text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl transition-colors text-xs font-medium flex items-center space-x-1"
            title="Comparar qualidade antes/depois"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden lg:inline">Comparar</span>
          </button>
        )}

        {/* Copy Button */}
        {isDone && (
          <button
            onClick={handleCopy}
            className="p-2 text-slate-600 hover:text-emerald-600 bg-slate-100 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-xl transition-colors text-xs font-medium"
            title="Copiar para área de transferência"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        )}

        {/* Download Single Image */}
        {isDone && (
          <button
            onClick={() => onDownload(item)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all flex items-center space-x-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Baixar</span>
          </button>
        )}

        {/* Delete button */}
        <button
          onClick={() => onRemove(item.id)}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
          title="Remover da lista"
        >
          <Trash2 className="w-4 h-4" />
        </button>

      </div>

    </div>
  );
};
