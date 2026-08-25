import { ImageFormat } from '../types';

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function getFormatExtension(mimeType: ImageFormat | string): string {
  switch (mimeType) {
    case 'image/png':
      return 'png';
    case 'image/jpeg':
    case 'image/jpg':
      return 'jpg';
    case 'image/webp':
      return 'webp';
    case 'image/avif':
      return 'avif';
    case 'image/gif':
      return 'gif';
    case 'image/svg+xml':
      return 'svg';
    default:
      if (mimeType.includes('/')) {
        return mimeType.split('/')[1];
      }
      return 'img';
  }
}

export function getFormatLabel(mimeType: ImageFormat | string): string {
  switch (mimeType) {
    case 'image/png':
      return 'PNG';
    case 'image/jpeg':
    case 'image/jpg':
      return 'JPG';
    case 'image/webp':
      return 'WebP';
    case 'image/avif':
      return 'AVIF';
    case 'image/gif':
      return 'GIF';
    case 'image/svg+xml':
      return 'SVG';
    default:
      return mimeType.replace('image/', '').toUpperCase();
  }
}

export function calculateAspectRatio(width: number, height: number): string {
  if (!width || !height) return '1:1';
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(Math.round(width), Math.round(height));
  const wRatio = Math.round(width) / divisor;
  const hRatio = Math.round(height) / divisor;
  
  if (wRatio > 20 || hRatio > 20) {
    return `${(width / height).toFixed(2)}:1`;
  }
  return `${wRatio}:${hRatio}`;
}

export function getFileNameWithoutExtension(filename: string): string {
  return filename.replace(/\.[^/.]+$/, '');
}
