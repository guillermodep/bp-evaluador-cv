import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter, 
  DialogClose
} from "@/components/ui/dialog";
import { Candidate } from '@/utils/evaluationUtils';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button"; 

interface CandidateDetailProps {
  candidate: Candidate | null;
  isOpen: boolean;
  onClose: () => void;
}

const CandidateDetail = ({ candidate, isOpen, onClose }: CandidateDetailProps) => {
  if (!candidate) return null;

  const handleCopyToATS = () => {
    if (!candidate) return;

    const atsText = `
Nombre: ${candidate.name || 'N/A'}
Archivo: ${candidate.fileName || 'N/A'}
Rol Sugerido: ${candidate.suggestedRole || 'N/A'}
Seniority: ${candidate.seniority || 'N/A'}
Puntuación: ${Math.round(candidate.score)}%

Experiencia (años): ${candidate.experience !== undefined ? candidate.experience : 'N/A'}
Educación Principal: ${candidate.education || 'N/A'}

Resumen de Experiencia:
${candidate.experienceSummary || 'N/A'}

Formación y Certificaciones:
${candidate.educationSummary || 'N/A'}

Habilidades Destacadas:
${candidate.matchedSkills && candidate.matchedSkills.length > 0 ? candidate.matchedSkills.join(', ') : 'N/A'}

Otras Habilidades:
${candidate.otherSkills || 'N/A'}
    `.trim();

    navigator.clipboard.writeText(atsText)
      .then(() => {
        alert('Datos del candidato copiados al portapapeles.');
      })
      .catch(err => {
        console.error('Error al copiar al portapapeles:', err);
        alert('Error al copiar datos. Revisa la consola.');
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3 text-gray-800">
            <span className="text-indigo-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </span>
            {candidate.name}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 pt-1">
            {candidate.fileName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6 space-y-6">
          {/* Encabezado con puntuación y rol sugerido */}
          <div className="flex justify-between items-start bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">Rol Sugerido</span>
              <span className="text-lg font-semibold text-indigo-700">{candidate.suggestedRole || 'N/A'}</span>
              {candidate.seniority && (
                <span className="text-sm text-indigo-600 mt-0.5">{candidate.seniority}</span>
              )}
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">Puntuación</span>
              <span className="text-3xl font-bold text-indigo-600">{Math.round(candidate.score)}%</span>
            </div>
          </div>
          
          {/* Compatibilidad general */}
          <div className="mb-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700">Compatibilidad General</span>
            </div>
            <Progress value={candidate.score} className="h-2.5 bg-slate-200" />
          </div>
          
          {/* Diseño principal de 2 columnas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Columna izquierda */} 
            <div className="space-y-4">
              {/* Experiencia y educación en una fila */} 
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                  <h3 className="text-xs text-indigo-500 uppercase tracking-wider mb-0.5">Experiencia</h3>
                  <p className="text-lg font-semibold text-indigo-700">{candidate.experience !== undefined ? `${candidate.experience} años` : 'N/A'}</p>
                </div>
                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                  <h3 className="text-xs text-indigo-500 uppercase tracking-wider mb-0.5">Educación Principal</h3>
                  <p className="text-base font-medium text-indigo-700 leading-tight">{candidate.education || 'N/A'}</p>
                </div>
              </div>
              
              {/* Resumen de experiencia */} 
              {candidate.experienceSummary && (
                <div className="border border-slate-200 p-4 rounded-lg bg-white">
                  <h3 className="text-sm font-semibold text-indigo-700 mb-1.5">Resumen de Experiencia</h3>
                  <p className="text-sm text-gray-700 font-normal leading-relaxed whitespace-pre-wrap">{candidate.experienceSummary}</p>
                </div>
              )}
              
              {/* Habilidades destacadas */} 
              {candidate.matchedSkills && candidate.matchedSkills.length > 0 && (
                <div className="border border-green-200 p-4 rounded-lg bg-white">
                  <h3 className="text-sm font-semibold text-green-700 mb-2">Habilidades Destacadas</h3>
                  <div className="flex flex-wrap gap-2">
                    {candidate.matchedSkills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200 font-normal text-xs px-2.5 py-1">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Columna derecha */} 
            <div className="space-y-4">
              {/* Formación y certificaciones */} 
              {candidate.educationSummary && (
                <div className="border border-blue-200 p-4 rounded-lg bg-white">
                  <h3 className="text-sm font-semibold text-blue-700 mb-1.5">Formación y Certificaciones</h3>
                  <p className="text-sm text-gray-700 font-normal leading-relaxed whitespace-pre-wrap">{candidate.educationSummary}</p>
                </div>
              )}
              
              {/* Otras habilidades */} 
              {candidate.otherSkills && (
                <div className="border border-purple-200 p-4 rounded-lg bg-white">
                  <h3 className="text-sm font-semibold text-purple-700 mb-1.5">Otras Habilidades</h3>
                  <p className="text-sm text-gray-700 font-normal leading-relaxed whitespace-pre-wrap">{candidate.otherSkills}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="mt-6 pt-4 border-t border-slate-200 flex flex-col-reverse sm:flex-row sm:justify-between gap-2">
          <Button 
            variant="outline" 
            onClick={handleCopyToATS}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 w-full sm:w-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-2">
              <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.121A1.5 1.5 0 0 1 17 6.621V16.5a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 16.5v-13Z" />
              <path d="M4.5 6A1.5 1.5 0 0 0 3 7.5v10A1.5 1.5 0 0 0 4.5 19h7a1.5 1.5 0 0 0 1.5-1.5v-1.5a.75.75 0 0 0-1.5 0V17.5a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5H6a.75.75 0 0 0 0-1.5H4.5Z" />
            </svg>
            Copiar para ATS
          </Button>
          <DialogClose asChild>
            <Button variant="ghost" onClick={onClose} className="text-slate-600 hover:bg-slate-100 w-full sm:w-auto">Cerrar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CandidateDetail;
