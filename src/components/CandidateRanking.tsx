import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileDown, FileText, Lightbulb, Star } from "lucide-react";
import { Candidate } from '@/utils/evaluationUtils';
import CandidateDetail from './CandidateDetail';
import { exportToPDF } from '@/utils/pdfExport';
import { exportToCSV } from '@/utils/csvExport';
import { exportToATSMarkdown } from '@/utils/atsExport';
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface CandidateRankingProps {
  candidates: Candidate[];
  selectedFileNames: string[];
  onToggleSelection: (fileName: string) => void;
}

const CandidateRanking = ({ candidates, selectedFileNames, onToggleSelection }: CandidateRankingProps) => {
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState<Candidate | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleCandidateClick = (candidate: Candidate, e?: React.MouseEvent<HTMLDivElement>) => {
    if (e) {
      const target = e.target as HTMLElement;
      if (target.closest('[data-no-detail-click="true"]')) {
        return;
      }
    }
    setSelectedCandidateDetail(candidate);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedCandidateDetail(null);
  };

  if (candidates.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No hay candidatos para mostrar en el ranking.</p>
        <p className="text-sm text-gray-400 mt-2">Intenta cargar algunos CVs o ajusta tus filtros.</p>
      </div>
    );
  }

  const sortedCandidates = [...candidates].sort((a, b) => b.score - a.score);

  return (
    <Card className="shadow-none border-none bg-transparent">
      <div className="space-y-4">
        {sortedCandidates.map((candidate, index) => (
          <div
            key={candidate.fileName}
            className={`p-4 rounded-lg transition-all duration-200 ease-in-out relative cursor-pointer ${selectedFileNames.includes(candidate.fileName) ? 'ring-2 ring-indigo-500 shadow-xl bg-indigo-50/50' : 'hover:shadow-md'} ${index === 0 && !selectedFileNames.includes(candidate.fileName) ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200' : index < 3 && !selectedFileNames.includes(candidate.fileName) ? 'bg-gradient-to-r from-indigo-50/30 to-purple-50/30 border border-indigo-100/30' : !selectedFileNames.includes(candidate.fileName) ? 'bg-white border border-gray-200 hover:bg-slate-50/50' : ''}`}
            onClick={(e) => handleCandidateClick(candidate, e)}
          >
            <div 
              data-no-detail-click="true"
              className="absolute top-3 right-3 z-20 p-1"
              onClick={(e) => e.stopPropagation()}
            >
              <Checkbox
                id={`select-candidate-rank-${candidate.fileName}`}
                checked={selectedFileNames.includes(candidate.fileName)}
                onCheckedChange={() => onToggleSelection(candidate.fileName)}
                aria-label={`Seleccionar ${candidate.name}`}
                className="h-5 w-5 rounded border-gray-400 data-[state=checked]:bg-indigo-600 data-[state=checked]:text-white transition-all duration-150 ease-in-out shadow"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
              <div className="flex items-center gap-3 mb-2 sm:mb-0">
                {index === 0 ? (
                  <div className="relative">
                    <span className="absolute inset-0 animate-ping rounded-full bg-yellow-400 opacity-20"></span>
                    <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900 font-bold shadow-sm">
                      {index + 1}
                    </span>
                    <Star className="h-4 w-4 text-yellow-500 absolute -top-1 -right-2 fill-yellow-400" />
                  </div>
                ) : index === 1 ? (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-slate-300 to-slate-400 text-slate-800 font-bold shadow-sm">
                    {index + 1}
                  </span>
                ) : index === 2 ? (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-orange-300 to-amber-400 text-orange-800 font-bold shadow-sm">
                    {index + 1}
                  </span>
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-medium">
                    {index + 1}
                  </span>
                )}
                <div>
                  <span className="font-medium text-gray-900 block text-base sm:text-lg">{candidate.name}</span>
                  <span className="text-xs text-gray-500">{candidate.experience} años • {candidate.education.split(' ')[0]}</span>
                </div>
              </div>
              <div className="flex flex-col items-start sm:items-end w-full sm:w-auto">
                <span className={`font-bold text-lg ${index === 0 ? 'text-yellow-600' : 'text-indigo-600'}`}>
                  {Math.round(candidate.score)}%
                </span>
                <span className="block text-sm font-semibold text-indigo-700 mt-0.5">
                  {candidate.suggestedRole || 'Rol no determinado'}
                </span>
                {candidate.seniority && (
                  <span className="block text-xs text-indigo-500">
                    {candidate.seniority}
                  </span>
                )}
              </div>
            </div>
            
            {candidate.suggestionReasoning && (
              <div className="mt-2 pt-2 border-t border-slate-200">
                <p className="text-xs text-slate-600 italic p-2 bg-slate-50 rounded-md border-l-4 border-slate-300">
                  <span className="flex items-center mb-1">
                    <Lightbulb className="h-4 w-4 mr-1.5 text-slate-500 flex-shrink-0" />
                    <strong className='text-slate-700 not-italic font-medium'>Justificación IA:</strong>
                  </span>
                  {candidate.suggestionReasoning}
                </p>
              </div>
            )}
            
            <div className="relative pt-1 mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-indigo-700">Compatibilidad</span>
              </div>
              <Progress value={candidate.score} className="h-2 bg-slate-200 [&>div]:bg-gradient-to-r [&>div]:from-indigo-500 [&>div]:to-purple-600" />
            </div>

            {candidate.matchedSkills && candidate.matchedSkills.length > 0 && (
              <div className="mt-3">
                <div className="flex flex-wrap gap-1.5">
                  {candidate.matchedSkills.slice(0, 4).map((skill, skillIndex) => (
                    <Badge key={skillIndex} variant="secondary" className="bg-indigo-50 text-indigo-700 text-xs font-normal px-2 py-0.5 hover:bg-indigo-100 transition-all">
                      {skill}
                    </Badge>
                  ))}
                  {candidate.matchedSkills.length > 4 && (
                    <Badge variant="outline" className="text-indigo-600 border-indigo-200 text-xs font-normal px-2 py-0.5">
                      +{candidate.matchedSkills.length - 4}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedCandidateDetail && (
        <CandidateDetail 
          candidate={selectedCandidateDetail} 
          isOpen={isDetailOpen} 
          onClose={handleCloseDetail} 
        />
      )}
    </Card>
  );
};

export default CandidateRanking;
