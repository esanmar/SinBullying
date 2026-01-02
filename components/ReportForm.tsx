import imageCompression from 'browser-image-compression';  // Importar la librería de compresión

// ... (dentro del componente React, asegúrate de tener definidos los estados `evidenceFiles` y `uploading`, y la función `uploadFile` del servicio)

const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!e.target.files) return;  // Si no hay archivos seleccionados, no hacer nada
  const filesArray = Array.from(e.target.files);

  // Validar número máximo de evidencias (3 archivos)
  if (evidenceFiles.length + filesArray.length > 3) {
    alert("Máximo 3 archivos.");  // Mostrar error si se excede el límite
    return;
  }

  setUploading(true);  // Indicar que el proceso de subida/compresión está en curso
  try {
    // Procesar cada archivo seleccionado
    const compressedFiles = await Promise.all(filesArray.map(async file => {
      // Si el archivo no es una imagen (ej: PDF), no se comprime
      if (!file.type.startsWith('image/')) {
        return file;
      }
      // Opcional: lanzar error si el archivo de imagen es extremadamente grande antes de comprimir (protección)
      if (file.size > 4.5 * 1024 * 1024) {  // 4.5 MB umbral de ejemplo
        throw new Error(`El archivo "${file.name}" es demasiado grande para subir.`);
      }

      // Configurar opciones de compresión: máx 2MB, máx 1280px, calidad inicial 0.75 (75%)
      const options = {
        maxSizeMB: 2,                      // Tamaño máximo objetivo: 2 MB:contentReference[oaicite:5]{index=5}
        maxWidthOrHeight: 1280,            // Dimensión máxima (ancho o alto): 1280 px:contentReference[oaicite:6]{index=6}:contentReference[oaicite:7]{index=7}
        useWebWorker: true,               // Usar un Web Worker para no bloquear el hilo principal
        initialQuality: 0.75              // Calidad inicial 75% (valor entre 0 y 1, por defecto es 1.0)
      };

      // Comprimir el archivo de imagen según las opciones
      const compressedBlob = await imageCompression(file, options);  // Devuelve un Blob (o File) comprimido:contentReference[oaicite:8]{index=8}

      // Convertir el Blob resultante a un File, conservando el nombre y tipo original
      let compressedFile: File;
      if (compressedBlob instanceof File) {
        compressedFile = compressedBlob;
      } else {
        compressedFile = new File(
          [compressedBlob],               // contenido Blob 
          file.name,                      // mismo nombre original
          { type: file.type, lastModified: Date.now() }  // mismo tipo MIME, timestamp actualizado
        );
      }

      // Verificar tamaño final del archivo comprimido; si aún excede 2MB, lanzar error
      if (compressedFile.size > 2 * 1024 * 1024) {
        throw new Error(`El archivo "${file.name}" sigue siendo demasiado pesado incluso tras comprimirlo (más de 2 MB).`);
      }

      return compressedFile;  // Devolver el archivo (imagen) comprimido listo para subir
    }));

    // Subir los archivos (imágenes comprimidas o archivos sin comprimir si no eran imágenes)
    const uploadedEvidences = await Promise.all(
      compressedFiles.map(file => uploadFile(file))
    );
    // Actualizar el estado de evidencias con los resultados de la subida (p. ej. URLs o datos recibidos)
    setEvidenceFiles(prev => [...prev, ...uploadedEvidences]);  // Añadir nuevas evidencias al listado:contentReference[oaicite:9]{index=9}
  } catch (error: any) {
    // Si ocurre algún error en compresión o subida, mostrar el mensaje al usuario
    alert(error.message);
  } finally {
    setUploading(false);       // Finalizar estado de carga
    e.target.value = "";       // Limpiar el input file para poder seleccionar los mismos archivos de nuevo si se requiere
  }
};
