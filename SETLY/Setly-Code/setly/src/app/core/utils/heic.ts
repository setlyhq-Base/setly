// Minimal client-side HEIC/HEIF -> JPEG converter
// Uses dynamic import to avoid adding weight unless needed.

export async function ensureDisplayableImage(file: File): Promise<File> {
  const name = file.name || '';
  const ext = (name.split('.').pop() || '').toLowerCase();
  const isHeic = ext === 'heic' || ext === 'heif' || file.type === 'image/heic' || file.type === 'image/heif';
  if (!isHeic) return file;

  try {
    // Single dynamic import (CommonJS compatibility) to avoid duplicate requests
    const mod: any = await import('heic2any');
    const heic2any = mod.default || mod;
    const convertedBlob: Blob | Blob[] = await heic2any({ blob: file as any, toType: 'image/jpeg', quality: 0.92 });
    // Library can return Blob[]; take first if array
    const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
    const newName = name.replace(/\.(heic|heif)$/i, '.jpg');
    return new File([blob], newName, { type: 'image/jpeg' });
  } catch (err) {
    console.warn('HEIC conversion failed, keeping original file', err);
    return file; // Fallback: keep original (may not preview in some browsers)
  }
}
