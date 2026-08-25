import { ConversionSettings, ImageAdjustments, CropArea, ProcessedImageResult, PRESETS } from '../types';

/**
 * Carrega um arquivo File em um elemento Image HTML
 */
export function loadImageFromFile(file: File): Promise<{ image: HTMLImageElement; width: number; height: number; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        resolve({ image: img, width: img.naturalWidth, height: img.naturalHeight, dataUrl });
      };
      img.onerror = (err) => reject(new Error('Erro ao carregar a imagem. O arquivo pode estar corrompido.'));
      img.src = dataUrl;
    };
    reader.onerror = (err) => reject(new Error('Erro ao ler o arquivo.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Calcula as dimensões finais com base no modo de redimensionamento
 */
export function calculateTargetDimensions(
  origWidth: number,
  origHeight: number,
  settings: ConversionSettings
): { width: number; height: number } {
  let targetWidth = origWidth;
  let targetHeight = origHeight;
  const aspectRatio = origWidth / origHeight;

  switch (settings.resizeMode) {
    case 'original':
      targetWidth = origWidth;
      targetHeight = origHeight;
      break;

    case 'auto':
      // Redimensionamento automático inteligente:
      // Se a imagem for gigante (> 2560px), limita suavemente a 2048px no maior lado mantendo proporção.
      const MAX_AUTO_DIM = 2048;
      if (origWidth > MAX_AUTO_DIM || origHeight > MAX_AUTO_DIM) {
        if (origWidth >= origHeight) {
          targetWidth = MAX_AUTO_DIM;
          targetHeight = Math.round(MAX_AUTO_DIM / aspectRatio);
        } else {
          targetHeight = MAX_AUTO_DIM;
          targetWidth = Math.round(MAX_AUTO_DIM * aspectRatio);
        }
      } else {
        targetWidth = origWidth;
        targetHeight = origHeight;
      }
      break;

    case 'percentage':
      const factor = Math.max(5, Math.min(200, settings.percentage)) / 100;
      targetWidth = Math.max(1, Math.round(origWidth * factor));
      targetHeight = Math.max(1, Math.round(origHeight * factor));
      break;

    case 'max_dimensions':
      const maxW = settings.maxWidth || 1920;
      const maxH = settings.maxHeight || 1080;
      let ratioW = maxW / origWidth;
      let ratioH = maxH / origHeight;
      let scale = Math.min(ratioW, ratioH, 1); // Não aumenta se for menor
      if (scale <= 0) scale = 1;
      targetWidth = Math.max(1, Math.round(origWidth * scale));
      targetHeight = Math.max(1, Math.round(origHeight * scale));
      break;

    case 'custom':
      const customW = settings.customWidth || origWidth;
      const customH = settings.customHeight || origHeight;
      if (settings.keepAspectRatio) {
        if (customW !== origWidth) {
          targetWidth = customW;
          targetHeight = Math.max(1, Math.round(customW / aspectRatio));
        } else if (customH !== origHeight) {
          targetHeight = customH;
          targetWidth = Math.max(1, Math.round(customH * aspectRatio));
        } else {
          targetWidth = customW;
          targetHeight = customH;
        }
      } else {
        targetWidth = customW;
        targetHeight = customH;
      }
      break;

    case 'preset':
      const preset = PRESETS.find(p => p.id === settings.selectedPresetId);
      if (preset) {
        targetWidth = preset.width;
        targetHeight = preset.height;
      }
      break;

    case 'target_size':
      // Dimensões iniciais são as originais; o ajustador de qualidade fará o downsizing
      targetWidth = origWidth;
      targetHeight = origHeight;
      break;

    default:
      targetWidth = origWidth;
      targetHeight = origHeight;
  }

  return { width: Math.max(1, targetWidth), height: Math.max(1, targetHeight) };
}

/**
 * Processa a imagem em um HTML Canvas de alta qualidade e converte para o formato/qualidade desejado.
 */
export async function processAndConvertImage(
  imageEl: HTMLImageElement,
  settings: ConversionSettings,
  adjustments?: ImageAdjustments,
  crop?: CropArea
): Promise<ProcessedImageResult> {
  const startTime = performance.now();

  let sourceWidth = imageEl.naturalWidth;
  let sourceHeight = imageEl.naturalHeight;

  // 1. Calcular dimensões base
  let { width: targetWidth, height: targetHeight } = calculateTargetDimensions(sourceWidth, sourceHeight, settings);

  // 2. Se houver corte (crop)
  let cropX = 0;
  let cropY = 0;
  let cropW = sourceWidth;
  let cropH = sourceHeight;

  if (crop && crop.width > 0 && crop.height > 0) {
    cropX = crop.x;
    cropY = crop.y;
    cropW = crop.width;
    cropH = crop.height;
    if (settings.resizeMode === 'original') {
      targetWidth = cropW;
      targetHeight = cropH;
    }
  }

  // Handle Rotation (90, 270 Inverte largura e altura no canvas final)
  const rotation = adjustments?.rotation || 0;
  const isSwapped = rotation === 90 || rotation === 270;
  
  const canvas = document.createElement('canvas');
  canvas.width = isSwapped ? targetHeight : targetWidth;
  canvas.height = isSwapped ? targetWidth : targetHeight;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Não foi possível obter contexto 2D do Canvas.');
  }

  // Suavização de imagem de alta definição
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 3. Fundo se transparente (para JPG e WebP/PNG quando desejado)
  if (settings.format === 'image/jpeg' || settings.fillColor) {
    ctx.fillStyle = settings.fillColor || '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // 4. Transformações (Rotação, Flip, Filtros)
  ctx.save();

  // Mover origem para o centro do canvas para rotacionar/espelhar
  ctx.translate(canvas.width / 2, canvas.height / 2);

  if (rotation !== 0) {
    ctx.rotate((rotation * Math.PI) / 180);
  }

  const scaleX = adjustments?.flipH ? -1 : 1;
  const scaleY = adjustments?.flipV ? -1 : 1;
  if (scaleX !== 1 || scaleY !== 1) {
    ctx.scale(scaleX, scaleY);
  }

  // Filtros de ajuste
  const brightness = adjustments?.brightness ?? 100;
  const contrast = adjustments?.contrast ?? 100;
  const saturation = adjustments?.saturation ?? 100;
  if (brightness !== 100 || contrast !== 100 || saturation !== 100) {
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
  }

  // Desenhar imagem cortada e escalada no centro
  const drawW = isSwapped ? targetHeight : targetWidth;
  const drawH = isSwapped ? targetWidth : targetHeight;

  ctx.drawImage(
    imageEl,
    cropX, cropY, cropW, cropH,
    -drawW / 2, -drawH / 2, drawW, drawH
  );

  ctx.restore();

  // 5. Exportar Blob
  let quality = settings.quality;
  let finalBlob: Blob | null = null;

  // Lógica de otimização de tamanho (target_size)
  if (settings.resizeMode === 'target_size' && settings.targetMaxFileSizeKB) {
    const targetMaxBytes = settings.targetMaxFileSizeKB * 1024;
    let minQ = 0.05;
    let maxQ = 1.0;
    let bestBlob: Blob | null = null;

    for (let attempt = 0; attempt < 6; attempt++) {
      const testQ = (minQ + maxQ) / 2;
      const blob = await new Promise<Blob | null>((res) =>
        canvas.toBlob((b) => res(b), settings.format, testQ)
      );
      if (!blob) break;

      if (blob.size <= targetMaxBytes) {
        bestBlob = blob;
        minQ = testQ; // Tenta aumentar qualidade um pouco se couber
      } else {
        maxQ = testQ; // Reduz qualidade
      }
    }

    finalBlob = bestBlob || (await new Promise<Blob | null>((res) =>
      canvas.toBlob((b) => res(b), settings.format, 0.1)
    ));
  } else {
    finalBlob = await new Promise<Blob | null>((res) =>
      canvas.toBlob((b) => res(b), settings.format, quality)
    );
  }

  if (!finalBlob) {
    throw new Error('Falha ao gerar o arquivo de imagem.');
  }

  const dataUrl = canvas.toDataURL(settings.format, quality);
  const endTime = performance.now();

  return {
    blob: finalBlob,
    dataUrl,
    width: canvas.width,
    height: canvas.height,
    fileSize: finalBlob.size,
    format: settings.format,
    processingTimeMs: Math.round(endTime - startTime)
  };
}

/**
 * Cria imagens de teste sintéticas coloridas para o botão "Carregar Imagens de Exemplo"
 */
export async function createSampleImages(): Promise<File[]> {
  const samples = [
    { name: 'exemplo_paisagem.png', width: 1920, height: 1080, type: 'image/png', bg1: '#3b82f6', bg2: '#1d4ed8', text: '📷 Exemplo Paisagem HD (PNG)' },
    { name: 'exemplo_foto_social.jpg', width: 2400, height: 2400, type: 'image/jpeg', bg1: '#ec4899', bg2: '#8b5cf6', text: '✨ Foto Alta Resolução (JPG)' },
    { name: 'exemplo_grafico.webp', width: 1200, height: 800, type: 'image/webp', bg1: '#10b981', bg2: '#047857', text: '📊 Gráficos & Transparência (WebP)' },
  ];

  const files: File[] = [];

  for (const item of samples) {
    const canvas = document.createElement('canvas');
    canvas.width = item.width;
    canvas.height = item.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, item.width, item.height);
      grad.addColorStop(0, item.bg1);
      grad.addColorStop(1, item.bg2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, item.width, item.height);

      // Pattern / shapes
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.arc(item.width * 0.3, item.height * 0.4, item.width * 0.25, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(item.width * 0.7, item.height * 0.7, item.width * 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Text
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.round(item.width / 22)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 15;
      ctx.fillText(item.text, item.width / 2, item.height / 2 - 20);

      ctx.font = `${Math.round(item.width / 40)}px sans-serif`;
      ctx.fillText(`Dimensões Originais: ${item.width} x ${item.height}px`, item.width / 2, item.height / 2 + 50);

      const blob = await new Promise<Blob | null>((res) => canvas.toBlob((b) => res(b), item.type, 0.95));
      if (blob) {
        files.push(new File([blob], item.name, { type: item.type }));
      }
    }
  }

  return files;
}
