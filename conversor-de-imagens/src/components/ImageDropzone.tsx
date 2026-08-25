import React, { useState, useRef, useEffect } from 'react';
import { Upload, Image as ImageIcon, Sparkles, AlertCircle, Plus, FileImage } from 'lucide-react';
import { createSampleImages } from '../utils/imageProcessor';

interface ImageDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  isLoadingSamples?: boolean;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({ onFilesSelected, isLoadingSamples }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [sampleLoading, setSampleLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Listener para Colar imagem diretamente da área de transferência (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            // Dar nome amigável se colar do clipboard
            const pastedFile = new File([file], `imagem_colada_${Date.now()}.png`, { type: file.type });
            imageFiles.push(pastedFile);
          }
        }
      }

      if (imageFiles.length > 0) {
        onFilesSelected(imageFiles);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onFilesSelected]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = Array.from(e.dataTransfer.files).filter((file: File) => file.type.startsWith('image/'));
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      onFilesSelected(selectedFiles);
      // Reset input value para permitir re-upload do mesmo arquivo
      e.target.value = '';
    }
  };

  const handleLoadSamples = async () => {
    try {
      setSampleLoading(true);
      const samples = await createSampleImages();
      onFilesSelected(samples);
    } catch (err) {
      console.error('Erro ao gerar amostras:', err);
    } finally {
      setSampleLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 p-8 sm:p-10 text-center flex flex-col items-center justify-center group bg-white shadow-sm hover:shadow-md ${
          isDragOver
            ? 'border-blue-500 bg-blue-50/80 scale-[1.005]'
            : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/80'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/png, image/jpeg, image/webp, image/avif, image/gif, image/svg+xml"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Upload Icon Circle */}
        <div className={`p-4 rounded-2xl mb-4 transition-transform duration-200 group-hover:scale-110 ${
          isDragOver ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
        }`}>
          <Upload className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-bold text-slate-800 mb-1">
          Arraste e solte suas imagens aqui
        </h3>
        <p className="text-sm text-slate-500 mb-4 max-w-md">
          Suporta os formatos <strong className="text-slate-700">PNG, JPG, WebP, GIF, AVIF, SVG</strong>. Você também pode clicar para selecionar ou colar com <kbd className="px-1.5 py-0.5 text-xs bg-slate-100 text-slate-700 border border-slate-300 rounded font-mono">Ctrl+V</kbd>.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Selecionar Imagens
          </button>

          <button
            type="button"
            onClick={handleLoadSamples}
            disabled={sampleLoading || isLoadingSamples}
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm border border-slate-200 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
          >
            <Sparkles className="w-4 h-4 mr-2 text-indigo-500" />
            {sampleLoading ? 'Gerando amostras...' : 'Usar Imagens de Exemplo'}
          </button>
        </div>
      </div>
    </div>
  );
};
