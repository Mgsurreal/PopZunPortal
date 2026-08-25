import React from 'react';
import { Image, Sparkles, Layers, Zap, Info } from 'lucide-react';

interface HeaderProps {
  totalCount: number;
  doneCount: number;
  onClearAll: () => void;
}

export const Header: React.FC<HeaderProps> = ({ totalCount, doneCount, onClearAll }) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl shadow-lg shadow-blue-500/20 text-white">
            <Image className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-lg tracking-tight text-white">Conversor de Imagens</h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
                Pro
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              PNG, JPG e WebP com redimensionamento e otimização em lote
            </p>
          </div>
        </div>

        {/* Formats Pills */}
        <div className="hidden md:flex items-center space-x-2 text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
          <span className="flex items-center text-emerald-400 font-medium">
            <Zap className="w-3.5 h-3.5 mr-1" />
            100% no Navegador
          </span>
          <span className="text-slate-600">•</span>
          <span className="font-semibold text-blue-400">PNG</span>
          <span className="text-slate-600">•</span>
          <span className="font-semibold text-amber-400">JPG</span>
          <span className="text-slate-600">•</span>
          <span className="font-semibold text-purple-400">WebP</span>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-3">
          {totalCount > 0 && (
            <div className="flex items-center space-x-3 text-xs">
              <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                {doneCount} / {totalCount} concluídas
              </span>
              <button
                onClick={onClearAll}
                className="text-slate-400 hover:text-rose-400 transition-colors text-xs font-medium px-2 py-1 rounded hover:bg-slate-800"
              >
                Limpar Tudo
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
