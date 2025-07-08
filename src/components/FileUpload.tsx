
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { UploadCloud, FileText, File, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploadProps {
  onFilesUploaded: (files: File[]) => void;
}

const FileUpload = ({ onFilesUploaded }: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleFileChange = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const filesArray = Array.from(newFiles).filter(
      file => file.type === 'application/msword' || 
              file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
              file.type === 'application/pdf'
    );

    if (filesArray.length !== Array.from(newFiles).length) {
        toast({
            title: "Algunos archivos fueron omitidos",
            description: "Solo se aceptan archivos Word (.doc, .docx) y PDF (.pdf).",
            variant: "default",
            duration: 4000,
        });
    }

    setSelectedFiles(prev => [...prev, ...filesArray]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileChange(e.dataTransfer.files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    handleFileChange(e.target.files);
  };

  const removeFile = (fileName: string) => {
    setSelectedFiles(prev => prev.filter(file => file.name !== fileName));
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      toast({ title: "No hay archivos seleccionados", variant: "destructive" });
      return;
    }
    onFilesUploaded(selectedFiles);
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  const FileIcon = ({ file }: { file: File }) => {
    if (file.type.includes('pdf')) return <File color="#e53e3e" className="h-6 w-6 flex-shrink-0" />;
    if (file.type.includes('word')) return <FileText color="#4299e1" className="h-6 w-6 flex-shrink-0" />;
    return <File className="h-6 w-6 flex-shrink-0 text-muted-foreground" />;
  }

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
      <div 
        className={`w-full p-6 text-center rounded-2xl border-2 border-dashed transition-all duration-300 ease-in-out ${
          dragActive 
            ? "border-primary bg-primary/10 scale-105 shadow-lg"
            : "border-border hover:border-primary/80 hover:bg-accent/50"
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={handleChange}
          accept=".doc,.docx,.pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
          <motion.div 
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <UploadCloud className="h-16 w-16 text-primary/70" />
          </motion.div>
          <p className="text-xl font-medium text-foreground">
            Arrastra tus archivos aquí o haz clic para seleccionar
          </p>
          <p className="text-sm">Soporta: DOC, DOCX, PDF</p>
        </div>
      </div>

      <AnimatePresence>
        {selectedFiles.length > 0 && (
          <motion.div 
            className="w-full mt-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h4 className="font-semibold text-lg mb-3 text-foreground">Archivos listos para analizar</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto rounded-lg border bg-background p-2">
              <AnimatePresence>
                {selectedFiles.map((file) => (
                  <motion.div 
                    key={file.name}
                    layout
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}
                    className="flex items-center justify-between bg-accent/50 p-3 rounded-md border"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileIcon file={file} />
                      <div className='overflow-hidden'>
                        <p className="truncate font-medium text-sm text-foreground">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeFile(file.name)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8">
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedFiles.length > 0 && (
        <motion.div className="w-full mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <Button 
            onClick={handleUpload} 
            size="lg"
            className="w-full font-bold text-lg py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-transform duration-200 hover:scale-105"
          >
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Evaluar {selectedFiles.length} CVs
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default FileUpload;
