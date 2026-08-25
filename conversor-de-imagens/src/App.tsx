import React, { useState, useEffect, useCallback } from 'react';
import {
  ImageItem,
  ConversionSettings,
  ImageAdjustments,
  CropArea,
  ProcessedImageResult,
} from './types';
import {
  loadImageFromFile,
  processAndConvertImage,
} from './utils/imageProcessor';
import {
  getFormatExtension,
  getFileNameWithoutExtension,
} from './utils/formatters';
import { Header } from './components/Header';
import { ImageDropzone } from './components/ImageDropzone';
import { GlobalSettingsPanel } from './components/GlobalSettingsPanel';
import { ImageCard } from './components/ImageCard';
import { BatchActions } from './components/BatchActions';
import { ImageCompareModal } from './components/ImageCompareModal';
import { ImageEditorModal } from './components/ImageEditorModal';
import { Sparkles, Image as ImageIcon, Zap, ShieldCheck } from 'lucide-react';

export default function App() {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [globalSettings, setGlobalSettings] = useState<ConversionSettings>({
    format: 'image/webp',
    quality: 0.85,
    resizeMode: 'auto',
    percentage: 100,
    maxWidth: 1920,
    maxHeight: 1080,
    customWidth: 1080,
    customHeight: 1080,
    keepAspectRatio: true,
    targetMaxFileSizeKB: 500,
    fillColor: '#ffffff',
  });

  const [compareItem, setCompareItem] = useState<ImageItem | null>(null);
  const [editorItem, setEditorItem] = useState<ImageItem | null>(null);

  // Função para processar um único item
  const processItem = useCallback(
    async (item: ImageItem, settings: ConversionSettings): Promise<ImageItem> => {
      try {
        const { image } = await loadImageFromFile(item.file);
        const result: ProcessedImageResult = await processAndConvertImage(
          image,
          settings,
          item.adjustments,
          item.crop
        );

        return {
          ...item,
          status: 'done',
          result,
          errorMessage: undefined,
        };
      } catch (err: any) {
        return {
          ...item,
          status: 'error',
          errorMessage: err.message || 'Erro ao processar imagem.',
        };
      }
    },
    []
  );

  // Adicionar arquivos selecionados
  const handleFilesSelected = async (newFiles: File[]) => {
    const newItems: ImageItem[] = [];

    for (const file of newFiles) {
      try {
        const { width, height, dataUrl } = await loadImageFromFile(file);
        const id = `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        
        const newItem: ImageItem = {
          id,
          file,
          originalName: file.name,
          originalSize: file.size,
          originalWidth: width,
          originalHeight: height,
          originalFormat: file.type || 'image/png',
          originalDataUrl: dataUrl,
          useGlobalSettings: true,
          adjustments: {
            rotation: 0,
            flipH: false,
            flipV: false,
            brightness: 100,
            contrast: 100,
            saturation: 100,
          },
          status: 'pending',
        };

        newItems.push(newItem);
      } catch (err) {
        console.error('Erro ao ler arquivo:', file.name, err);
      }
    }

    if (newItems.length === 0) return;

    setItems((prev) => [...prev, ...newItems]);

    // Iniciar processamento
    for (const item of newItems) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'processing' } : i))
      );
      const processed = await processItem(item, globalSettings);
      setItems((prev) => prev.map((i) => (i.id === item.id ? processed : i)));
    }
  };

  // Re-processar todos quando as configurações globais mudarem
  const handleSettingsChange = async (newSettings: ConversionSettings) => {
    setGlobalSettings(newSettings);

    // Re-processar itens que usam configurações globais
    setItems((prev) =>
      prev.map((i) => (i.useGlobalSettings ? { ...i, status: 'processing' } : i))
    );

    setItems((prevItems) => {
      const updatedPromises = prevItems.map(async (item) => {
        if (item.useGlobalSettings) {
          return await processItem(item, newSettings);
        }
        return item;
      });

      Promise.all(updatedPromises).then((results) => {
        setItems(results);
      });

      return prevItems;
    });
  };

  // Salvar ajustes da modal de edição (rotação, brilho)
  const handleSaveEditor = async (
    id: string,
    adjustments: ImageAdjustments,
    crop?: CropArea
  ) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, adjustments, crop, status: 'processing' } : i
      )
    );

    const currentItem = items.find((i) => i.id === id);
    if (!currentItem) return;

    const updatedItem = { ...currentItem, adjustments, crop };
    const processed = await processItem(
      updatedItem,
      currentItem.customSettings || globalSettings
    );

    setItems((prev) => prev.map((i) => (i.id === id ? processed : i)));
  };

  // Download individual de imagem
  const handleDownloadSingle = (item: ImageItem) => {
    if (!item.result?.blob) return;

    const ext = getFormatExtension(item.result.format);
    const baseName = getFileNameWithoutExtension(item.originalName);
    const fileName = `${baseName}_convertida.${ext}`;

    const url = URL.createObjectURL(item.result.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Remover item
  const handleRemove = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Limpar lista completa
  const handleClearAll = () => {
    setItems([]);
  };

  const doneCount = items.filter((i) => i.status === 'done').length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      <Header
        totalCount={items.length}
        doneCount={doneCount}
        onClearAll={handleClearAll}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Upload Zone */}
        <ImageDropzone onFilesSelected={handleFilesSelected} />

        {/* Global Settings Panel & Actions */}
        {items.length > 0 && (
          <div className="space-y-6">
            <GlobalSettingsPanel
              settings={globalSettings}
              onChange={handleSettingsChange}
              onApplyToAll={() => handleSettingsChange(globalSettings)}
            />

            {/* Batch Actions Stats Banner */}
            <BatchActions
              items={items}
              onClearAll={handleClearAll}
              onConvertAll={() => handleSettingsChange(globalSettings)}
            />

            {/* Image Cards List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-bold text-slate-800 text-base flex items-center space-x-2">
                  <ImageIcon className="w-5 h-5 text-blue-600" />
                  <span>Fila de Conversão ({items.length})</span>
                </h3>
                <span className="text-xs text-slate-500">
                  Clique na imagem para comparar a qualidade
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {items.map((item) => (
                  <ImageCard
                    key={item.id}
                    item={item}
                    onRemove={handleRemove}
                    onOpenCompare={setCompareItem}
                    onOpenEditor={setEditorItem}
                    onDownload={handleDownloadSingle}
                    onConvertSingle={(id) => {
                      const found = items.find((i) => i.id === id);
                      if (found) processItem(found, globalSettings);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Informational Feature Highlights when empty */}
        {items.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Privacidade Total</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Suas imagens nunca são enviadas para servidores externos. Todo o processamento e redimensionamento ocorre localmente no seu próprio navegador.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Redimensionamento Inteligente</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Redimencione por percentual, limites de largura/altura, resolução personalizada ou presets otimizados para redes sociais como Instagram e YouTube.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Alta Compressão & Nitidez</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Converta arquivos PNG pesados em WebP ou JPG ultra-leves mantendo máxima fidelidade visual e economizando até 80% do espaço em disco.
              </p>
            </div>
          </div>
        )}

      </main>

      {/* Modals */}
      <ImageCompareModal
        item={compareItem}
        onClose={() => setCompareItem(null)}
        onDownload={handleDownloadSingle}
      />

      <ImageEditorModal
        item={editorItem}
        onClose={() => setEditorItem(null)}
        onSave={handleSaveEditor}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Conversor de Imagens PNG • JPG • WebP com Redimensionamento Automático</span>
          <span className="text-slate-400">Processado com Canvas 2D de Alta Qualidade</span>
        </div>
      </footer>
    </div>
  );
}
