import React, { useState, useRef } from 'react';
import { compressImage, validateFile, formatFileSize } from '../utils/imageCompression';
import { uploadFile } from '../services/bkndService';
import { Evidence } from '../types';

interface FileUploaderProps {
  onUploadComplete: (evidence: Evidence) => void;
  maxFiles?: number;
  currentFiles?: Evidence[];
}

export const FileUploader: React.FC<FileUploaderProps> = ({ 
  onUploadComplete, 
  maxFiles = 5,
  currentFiles = []
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Verificar límite de archivos
    if (currentFiles.length >= maxFiles) {
      setError(`Máximo ${maxFiles} archivos permitidos`);
      return;
    }

    const file = files[0];
    setError('');
    setIsUploading(true);
    setUploadProgress('Validando archivo...');

    try {
      // Validar archivo
      const validation = validateFile(file, 10);
      if (validation !== true) {
        throw new Error(validation);
      }

      // Comprimir si es imagen
      let fileToUpload = file;
      if (file.type.startsWith('image/')) {
        setUploadProgress(`Comprimiendo imagen (${formatFileSize(file.size)})...`);
        fileToUpload = await compressImage(file, {
          maxSizeMB: 2,
          maxWidthOrHeight: 1920,
        });
        
        if (fileToUpload.size < file.size) {
          setUploadProgress(`Imagen comprimida: ${formatFileSize(file.size)} → ${formatFileSize(fileToUpload.size)}`);
          await new Promise(resolve => setTimeout(resolve, 500)); // Mostrar mensaje brevemente
        }
      }

      // Subir archivo
      setUploadProgress('Subiendo archivo...');
      const evidence = await uploadFile(fileToUpload);
      
      setUploadProgress('¡Archivo subido exitosamente!');
      onUploadComplete(evidence);
      
      // Limpiar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Limpiar mensaje de éxito después de 2 segundos
      setTimeout(() => {
        setUploadProgress('');
      }, 2000);

    } catch (err: any) {
      console.error('Error uploading file:', err);
      setError(err.message || 'Error al subir el archivo');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <label 
          className={`
            flex-1 flex items-center justify-center gap-2 
            px-4 py-3 border-2 border-dashed rounded-lg
            cursor-pointer transition-all
            ${isUploading 
              ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
              : 'border-brand-300 hover:border-brand-500 hover:bg-brand-50'
            }
          `}
        >
          <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span className="text-sm font-medium text-gray-700">
            {isUploading ? 'Subiendo...' : 'Seleccionar archivo'}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,video/mp4,video/webm,video/quicktime,application/pdf"
            onChange={handleFileSelect}
            disabled={isUploading || currentFiles.length >= maxFiles}
          />
        </label>
      </div>

      {/* Progreso de carga */}
      {uploadProgress && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg animate-fade-in">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
          <span className="text-sm text-blue-700">{uploadProgress}</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 animate-fade-in">
          {error}
        </div>
      )}

      {/* Información */}
      <p className="text-xs text-gray-500">
        Formatos permitidos: Imágenes (JPG, PNG, GIF, WebP), Videos (MP4, WebM), PDF. 
        Máximo 10MB por archivo. {currentFiles.length}/{maxFiles} archivos subidos.
      </p>
    </div>
  );
};

export default FileUploader;
