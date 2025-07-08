
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Upload, Check, X } from "lucide-react";

interface FileUploadProps {
  onFilesUploaded: (files: File[]) => void;
}

const FileUpload = ({ onFilesUploaded }: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type === 'application/msword' || 
              file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
              file.type === 'application/pdf'
    );
    
    if (files.length === 0) {
      toast({
        title: "Formato no válido",
        description: "Por favor sube archivos Word (.doc/.docx) o PDF (.pdf)",
        variant: "destructive"
      });
      return;
    }

    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).filter(
        file => file.type === 'application/msword' || 
                file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                file.type === 'application/pdf'
      );
      
      if (files.length === 0) {
        toast({
          title: "Formato no válido",
          description: "Por favor sube archivos Word (.doc/.docx)",
          variant: "destructive"
        });
        return;
      }

      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No hay archivos",
        description: "Por favor selecciona al menos un archivo para evaluar",
        variant: "destructive"
      });
      return;
    }

    // Verificar si hay archivos PDF que podrían tener problemas
    const pdfFiles = selectedFiles.filter(file => 
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    );
    
    if (pdfFiles.length > 0) {
      toast({
        title: "Procesando archivos",
        description: `Analizando ${selectedFiles.length} archivo${selectedFiles.length > 1 ? 's' : ''}. Algunos archivos PDF podrían no procesarse correctamente debido a su estructura interna. Los archivos que no se puedan procesar serán omitidos del análisis.`,
        duration: 5000,
      });
    } else {
      toast({
        title: "Procesando con Azure OpenAI",
        description: `Analizando ${selectedFiles.length} CV${selectedFiles.length > 1 ? 's' : ''} con GPT-4.1 Nano...`,
      });
    }
    
    // Llamar a la función de evaluación
    onFilesUploaded(selectedFiles);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div 
        className={`border-2 border-dashed rounded-2xl p-10 mb-6 text-center transition-all ${
          dragActive 
            ? "border-indigo-400 bg-gradient-to-b from-indigo-50/70 to-purple-50/50 shadow-md" 
            : "border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50/20"
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
          <Upload className="h-10 w-10 text-indigo-500" />
        </div>
        
        <h3 className="text-2xl font-medium mb-2 text-gray-800">
          Arrastra y suelta tus CVs aquí
        </h3>
        <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
          Formatos aceptados: DOC, DOCX y PDF. Puedes seleccionar múltiples archivos a la vez.
        </p>
        <input
          type="file"
          multiple
          onChange={handleChange}
          accept=".doc,.docx,.pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button variant="outline" className="cursor-pointer bg-white hover:bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm transition-all hover:shadow px-6 py-5 h-auto">
            <Upload className="h-4 w-4 mr-2" /> Seleccionar archivos
          </Button>
        </label>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium mb-3 text-gray-700">Archivos seleccionados ({selectedFiles.length})</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto p-1 rounded-lg bg-white/50">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-indigo-100 shadow-sm">
                <div className="flex items-center">
                  <div className="p-1.5 bg-indigo-50 rounded-md mr-3">
                    <svg className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="truncate max-w-[80%] text-sm">{file.name}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeFile(index)} className="text-gray-400 hover:text-red-500 hover:bg-red-50">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button 
        onClick={handleUpload} 
        disabled={selectedFiles.length === 0}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md"
      >
        Evaluar CVs ({selectedFiles.length})
      </Button>
    </div>
  );
};

export default FileUpload;
