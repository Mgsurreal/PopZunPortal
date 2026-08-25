export type ImageFormat = 'image/png' | 'image/jpeg' | 'image/webp';

export type ResizeMode = 
  | 'original'       // Manter dimensões originais
  | 'auto'           // Redimensionamento inteligente baseado na tela/web
  | 'percentage'     // Escala percentual (ex: 75%, 50%, 25%)
  | 'max_dimensions' // Máximo de Largura/Altura mantendo proporção
  | 'custom'         // Largura e Altura personalizadas
  | 'preset'         // Redes Sociais e Padrões Web
  | 'target_size';   // Tentar otimizar para tamanho máximo de arquivo (ex: < 500KB)

export interface PresetOption {
  id: string;
  name: string;
  category: 'social' | 'web' | 'standard';
  width: number;
  height: number;
  aspectRatio: string;
  description: string;
}

export interface ImageAdjustments {
  rotation: number; // 0, 90, 180, 270
  flipH: boolean;
  flipV: boolean;
  brightness: number; // 50 - 150 (default 100)
  contrast: number;   // 50 - 150 (default 100)
  saturation: number; // 0 - 200 (default 100)
}

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ConversionSettings {
  format: ImageFormat;
  quality: number; // 0.1 to 1.0 (para JPG e WebP)
  resizeMode: ResizeMode;
  percentage: number; // 10 a 100
  maxWidth: number;
  maxHeight: number;
  customWidth: number;
  customHeight: number;
  keepAspectRatio: boolean;
  selectedPresetId?: string;
  targetMaxFileSizeKB?: number; // Para modo target_size
  fillColor: string; // Fundo para transparência ao converter PNG -> JPG (ex: #ffffff)
}

export interface ProcessedImageResult {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  fileSize: number;
  format: ImageFormat;
  processingTimeMs: number;
}

export interface ImageItem {
  id: string;
  file: File;
  originalName: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  originalFormat: string;
  originalDataUrl: string;
  
  // Custom settings overridable per item or using global
  useGlobalSettings: boolean;
  customSettings?: ConversionSettings;
  adjustments: ImageAdjustments;
  crop?: CropArea;

  // State
  status: 'pending' | 'processing' | 'done' | 'error';
  errorMessage?: string;
  result?: ProcessedImageResult;
}

export const PRESETS: PresetOption[] = [
  {
    id: 'insta-square',
    name: 'Instagram Quadrado',
    category: 'social',
    width: 1080,
    height: 1080,
    aspectRatio: '1:1',
    description: 'Postagem quadrada padrão (1080 x 1080px)'
  },
  {
    id: 'insta-portrait',
    name: 'Instagram Retrato',
    category: 'social',
    width: 1080,
    height: 1350,
    aspectRatio: '4:5',
    description: 'Feed vertical otimizado (1080 x 1350px)'
  },
  {
    id: 'insta-story',
    name: 'Instagram Story / Reels',
    category: 'social',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    description: 'Stories, Reels e TikTok (1080 x 1920px)'
  },
  {
    id: 'yt-thumb',
    name: 'Miniatura YouTube',
    category: 'social',
    width: 1280,
    height: 720,
    aspectRatio: '16:9',
    description: 'Thumbnail em alta resolução (1280 x 720px)'
  },
  {
    id: 'web-banner',
    name: 'Banner Web / Facebook',
    category: 'web',
    width: 1200,
    height: 630,
    aspectRatio: '1.91:1',
    description: 'Capa e imagem de compartilhamento OpenGraph'
  },
  {
    id: 'hd-1080',
    name: 'Full HD 1080p',
    category: 'standard',
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
    description: 'Resolução padrão 1920 x 1080px'
  },
  {
    id: 'ultra-4k',
    name: '4K Ultra HD',
    category: 'standard',
    width: 3840,
    height: 2160,
    aspectRatio: '16:9',
    description: 'Resolução alta 3840 x 2160px'
  },
  {
    id: 'avatar-icon',
    name: 'Avatar / Ícone Web',
    category: 'web',
    width: 512,
    height: 512,
    aspectRatio: '1:1',
    description: 'Foto de perfil e ícones (512 x 512px)'
  }
];
