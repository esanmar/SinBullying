import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  fileType?: string;
}

/**
 * Comprime una imagen antes de subirla al servidor
 * @param file Archivo de imagen a comprimir
 * @param options Opciones de compresión
 * @returns Archivo comprimido
 */
export async function compressImage(
  file: File, 
  options: CompressionOptions = {}
): Promise<File> {
  // Solo comprimir imágenes
  if (!file.type.startsWith('image/')) {
    return file;
  }

  // Configuración por defecto
  const defaultOptions = {
    maxSizeMB: 2, // Máximo 2MB después de compresión
    maxWidthOrHeight: 1920, // Máximo 1920px de ancho/alto
    useWebWorker: true,
    fileType: file.type,
    ...options
  };

  try {
    console.log(`Comprimiendo imagen: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    
    const compressedFile = await imageCompression(file, defaultOptions);
    
    console.log(`Imagen comprimida: ${compressedFile.name} (${(compressedFile.size / 1024 / 1024).toFixed(2)}MB)`);
    
    return compressedFile;
  } catch (error) {
    console.error('Error al comprimir imagen:', error);
    // Si falla la compresión, devolver el archivo original
    return file;
  }
}

/**
 * Valida que un archivo sea del tipo correcto y no exceda el tamaño máximo
 * @param file Archivo a validar
 * @param maxSizeMB Tamaño máximo en MB
 * @returns true si es válido, mensaje de error si no lo es
 */
export function validateFile(file: File, maxSizeMB: number = 10): string | true {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'application/pdf'
  ];

  if (!allowedTypes.includes(file.type)) {
    return 'Tipo de archivo no permitido. Solo se permiten imágenes, videos (MP4, WebM) y PDFs.';
  }

  const fileSizeMB = file.size / 1024 / 1024;
  if (fileSizeMB > maxSizeMB) {
    return `El archivo es demasiado grande (${fileSizeMB.toFixed(2)}MB). Máximo permitido: ${maxSizeMB}MB`;
  }

  return true;
}

/**
 * Formatea el tamaño de un archivo para mostrarlo al usuario
 * @param bytes Tamaño en bytes
 * @returns Tamaño formateado (ej: "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
