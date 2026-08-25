import React, { useState } from 'react';
import { ImageItem } from '../types';
import { Download, Trash2, Sparkles, FolderArchive, Check, Layers } from 'lucide-react';
import { formatBytes, getFormatExtension, getFileNameWithoutExtension } from '../utils/formatters';
import JSZip from 'jszip';

interface BatchActionsProps {
  items: ImageItem[];
  onClearAll: () => void;
  onConvertAll: () => void;
  isProcessing?: boolean;
}

export const BatchActions: React.FC<BatchActionsProps> = ({
  items,
  onClearAll,
  onConvertAll,
  isProcessing,
}) => {
  const [isZipping, setIsZipping] = useState(false);

  const doneItems = items.filter((i) => i.status === 'done' && i.result);
  const totalOriginalBytes = doneItems.reduce((acc, i) => acc + i.originalSize, 0);
  const totalConvertedBytes = doneItems.reduce((acc, i) => acc + (i.result?.fileSize || 0), 0);
  const totalSavingsBytes = totalOriginalBytes - totalConvertedBytes;
  const totalSavingsPct = totalOriginalBytes > 0 ? Math.round((totalSavingsBytes / totalOriginalBytes) * 100) : 0;

  const handleDownloadZip = async () => {
    if (doneItems.length === 0) return;

    try {
      setIsZipping(true);
      const zip = new JSZip();

      for (let index = 0; index < doneItems.length; index++) {
        const item = doneItems[index];
        if (item.result?.blob) {
          const ext = getFormatExtension(item.result.format);
          const baseName = getFileNameWithoutExtension(item.originalName);
          const fileName = `${baseName}_convertida.${ext}`;
          zip.file(fileName, item.result.blob);
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `imagens_convertidas_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao gerar arquivo ZIP:', err);
    } finally {
      setIsZipping(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 rounded-2xl shadow-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
      
      {/* Total Statistics */}
      <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 text-xs block">Total de Imagens</span>
            <span className="font-bold text-base">{doneItems.length} de {items.length} prontas</span>
          </div>
        </div>

        {doneItems.length > 0 && (
          <div className="border-l border-slate-800 pl-6 space-y-0.5">
            <span className="text-slate-400 text-xs block">Economia Total de Espaço</span>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base text-emerald-400">
                {formatBytes(totalConvertedBytes)}
              </span>
              <span className="text-xs text-slate-400">
                (era {formatBytes(totalOriginalBytes)})
              </span>
              {totalSavingsBytes > 0 && (
                <span className="bg-emerald-500/20 text-emerald-300 font-bold text-xs px-2 py-0.5 rounded-md border border-emerald-500/30">
                  -{totalSavingsPct}%
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
        <button
          onClick={onClearAll}
          className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-colors flex items-center space-x-1.5"
        >
          <Trash2 className="w-4 h-4" />
          <span>Limpar</span>
        </button>

        {doneItems.length > 0 && (
          <button
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            <FolderArchive className="w-4.5 h-4.5" />
            <span>{isZipping ? 'Criando ZIP...' : `Baixar Todas em ZIP (${doneItems.length})`}</span>
          </button>
        )}
      </div>

    </div>
  );
};
