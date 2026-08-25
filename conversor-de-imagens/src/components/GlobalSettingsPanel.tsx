import React from 'react';
import { ConversionSettings, ImageFormat, ResizeMode, PRESETS } from '../types';
import { Sliders, Maximize2, Zap, Palette, Lock, Unlock, Scale, Target, Sparkles, Check, LayoutGrid } from 'lucide-react';
import { getFormatLabel } from '../utils/formatters';

interface GlobalSettingsPanelProps {
  settings: ConversionSettings;
  onChange: (newSettings: ConversionSettings) => void;
  onApplyToAll: () => void;
  isProcessing?: boolean;
}

export const GlobalSettingsPanel: React.FC<GlobalSettingsPanelProps> = ({
  settings,
  onChange,
  onApplyToAll,
  isProcessing
}) => {
  const handleFormatChange = (format: ImageFormat) => {
    onChange({ ...settings, format });
  };

  const handleResizeModeChange = (resizeMode: ResizeMode) => {
    onChange({ ...settings, resizeMode });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-6">
      {/* Title & Apply Button */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-base">Configurações de Conversão</h2>
            <p className="text-xs text-slate-500">Defina o formato, qualidade e dimensões de saída</p>
          </div>
        </div>

        <button
          onClick={onApplyToAll}
          disabled={isProcessing}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Aplicar a Todas</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Formato de Saída */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span>Formato de Saída</span>
            <span className="text-[10px] text-slate-400 font-normal">Selecione o destino</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['image/webp', 'image/jpeg', 'image/png'] as ImageFormat[]).map((fmt) => {
              const isSelected = settings.format === fmt;
              const label = getFormatLabel(fmt);
              const badgeText = fmt === 'image/webp' ? 'Recomendado' : fmt === 'image/jpeg' ? 'Menor Tam.' : 'Sem Perda';
              
              return (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => handleFormatChange(fmt)}
                  className={`relative p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 text-blue-700 shadow-sm ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50'
                  }`}
                >
                  <span className="font-bold text-sm">{label}</span>
                  <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-blue-600 font-medium' : 'text-slate-400'}`}>
                    {badgeText}
                  </span>
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Qualidade (Para JPG e WebP) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Qualidade da Imagem
            </label>
            <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {Math.round(settings.quality * 100)}%
            </span>
          </div>

          <div className="pt-1">
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={Math.round(settings.quality * 100)}
              onChange={(e) => onChange({ ...settings, quality: parseInt(e.target.value, 10) / 100 })}
              disabled={settings.format === 'image/png'}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-40"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>Alta Compressão (Menor)</span>
              <span>Balanceado (80%)</span>
              <span>Máxima Nitidez</span>
            </div>
          </div>
          {settings.format === 'image/png' && (
            <p className="text-[11px] text-slate-400 italic">
              * O formato PNG utiliza compressão sem perda de dados (lossless).
            </p>
          )}
        </div>

        {/* 3. Fundo de Transparência (se PNG para JPG) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span>Fundo para Transparência</span>
            <span className="text-[10px] text-slate-400 font-normal">Para JPG</span>
          </label>
          <div className="flex items-center space-x-2">
            {[
              { color: '#ffffff', label: 'Branco' },
              { color: '#000000', label: 'Preto' },
              { color: '#f3f4f6', label: 'Cinza' },
            ].map((c) => (
              <button
                key={c.color}
                type="button"
                onClick={() => onChange({ ...settings, fillColor: c.color })}
                className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-2 rounded-xl border text-xs font-medium transition-all ${
                  settings.fillColor === c.color
                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold ring-1 ring-blue-500'
                    : 'border-slate-200 text-slate-600 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-inner"
                  style={{ backgroundColor: c.color }}
                />
                <span>{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Modo de Redimensionamento Automático / Personalizado */}
      <div className="border-t border-slate-100 pt-5 space-y-4">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center">
            <Maximize2 className="w-4 h-4 mr-1.5 text-blue-600" />
            Modo de Redimensionamento Automático & Presets
          </span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {[
            { id: 'auto', label: 'Automático', icon: Sparkles, desc: 'Otimizado' },
            { id: 'original', label: 'Manter Orig.', icon: Scale, desc: '100% Tamanho' },
            { id: 'percentage', label: 'Percentual', icon: Sliders, desc: '50%, 75%...' },
            { id: 'max_dimensions', label: 'Max W x H', icon: Maximize2, desc: 'Fit dentro de WxH' },
            { id: 'preset', label: 'Presets Sociais', icon: LayoutGrid, desc: 'Instagram, YT' },
            { id: 'target_size', label: 'Tamanho Alvo', icon: Target, desc: '< 500 KB' },
          ].map((mode) => {
            const isSelected = settings.resizeMode === mode.id;
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => handleResizeModeChange(mode.id as ResizeMode)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/90 text-blue-700 shadow-sm ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center space-x-1.5 mb-1">
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600' : 'text-slate-500'}`} />
                  <span className="font-bold text-xs truncate">{mode.label}</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">{mode.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Sub-painéis de Redimensionamento dinâmicos */}
        {settings.resizeMode === 'percentage' && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">Percentual de Escala:</span>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              {[25, 50, 75, 90].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => onChange({ ...settings, percentage: pct })}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    settings.percentage === pct
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500">Outro:</span>
              <input
                type="number"
                min="5"
                max="200"
                value={settings.percentage}
                onChange={(e) => onChange({ ...settings, percentage: Math.max(5, Math.min(200, parseInt(e.target.value) || 100)) })}
                className="w-16 px-2 py-1 text-xs font-semibold border border-slate-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-xs font-bold text-slate-600">%</span>
            </div>
          </div>
        )}

        {settings.resizeMode === 'max_dimensions' && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">Largura Máxima (px):</label>
              <input
                type="number"
                value={settings.maxWidth}
                onChange={(e) => onChange({ ...settings, maxWidth: parseInt(e.target.value) || 1920 })}
                className="w-full px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="1920"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">Altura Máxima (px):</label>
              <input
                type="number"
                value={settings.maxHeight}
                onChange={(e) => onChange({ ...settings, maxHeight: parseInt(e.target.value) || 1080 })}
                className="w-full px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="1080"
              />
            </div>
          </div>
        )}

        {settings.resizeMode === 'preset' && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <label className="text-xs font-semibold text-slate-700 block">Selecione o Preset Desejado:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
              {PRESETS.map((preset) => {
                const isSelected = settings.selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onChange({ ...settings, selectedPresetId: preset.id })}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs">{preset.name}</div>
                    <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                      {preset.width} × {preset.height}px ({preset.aspectRatio})
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {settings.resizeMode === 'target_size' && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">Tamanho Máximo do Arquivo:</span>
            <div className="flex items-center space-x-2">
              {[200, 500, 1000, 2000].map((sizeKB) => (
                <button
                  key={sizeKB}
                  type="button"
                  onClick={() => onChange({ ...settings, targetMaxFileSizeKB: sizeKB })}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    settings.targetMaxFileSizeKB === sizeKB
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {sizeKB >= 1000 ? `${sizeKB / 1000} MB` : `${sizeKB} KB`}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500">Manual (KB):</span>
              <input
                type="number"
                min="50"
                max="10000"
                value={settings.targetMaxFileSizeKB || 500}
                onChange={(e) => onChange({ ...settings, targetMaxFileSizeKB: parseInt(e.target.value) || 500 })}
                className="w-20 px-2 py-1 text-xs font-semibold border border-slate-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
