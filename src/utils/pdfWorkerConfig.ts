import * as pdfjsLib from 'pdfjs-dist';

// Configurar el worker de PDF.js para entornos de navegador
const configurePdfWorker = () => {
  // Verificar si estamos en un entorno de navegador
  if (typeof window !== 'undefined') {
    // Usar un CDN para el worker de PDF.js
    pdfjsLib.GlobalWorkerOptions.workerSrc = 
      `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    
    console.log('PDF.js worker configurado correctamente');
  } else {
    console.warn('No se pudo configurar el worker de PDF.js - no estamos en un entorno de navegador');
  }
};

export default configurePdfWorker;
