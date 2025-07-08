import React, { useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from "@/components/ui/progress";
import { Lightbulb, Star, Award, Medal, Check } from "lucide-react";
import { Candidate } from '@/utils/evaluationUtils';
import CandidateDetail from './CandidateDetail';
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from '@/lib/utils';

const cardVariants = cva(
  "p-4 rounded-lg transition-all duration-300 ease-in-out relative cursor-pointer border-2",
  {
    variants: {
      variant: {
        default: "bg-card border-border hover:border-primary/50 hover:shadow-md",
        top: "bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 dark:from-yellow-900/20 dark:via-amber-900/20 dark:to-yellow-800/20 border-yellow-400/80",
        second: "bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/20 dark:to-slate-700/20 border-slate-300/80",
        third: "bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-800/20 border-orange-300/70",
      },
      selected: {
        true: "ring-2 ring-offset-2 ring-primary shadow-xl scale-[1.02]",
        false: "",
      }
    },
    defaultVariants: {
      variant: "default",
      selected: false,
    },
  }
);

interface CandidateRankingProps extends VariantProps<typeof cardVariants> {
  candidates: Candidate[];
  selectedFileNames: string[];
  onToggleSelection: (fileName: string) => void;
}

const RankingIcon = ({ rank }: { rank: number }) => {
  if (rank === 0) return <Award className="h-7 w-7 text-yellow-500 fill-yellow-400" />;
  if (rank === 1) return <Medal className="h-7 w-7 text-slate-500 fill-slate-400" />;
  if (rank === 2) return <Star className="h-7 w-7 text-orange-500 fill-orange-400" />;
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground font-bold text-sm">
      {rank + 1}
    </span>
  );
};

const CandidateRanking = ({ candidates, selectedFileNames, onToggleSelection }: CandidateRankingProps) => {
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState<Candidate | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleCandidateClick = (candidate: Candidate, e?: React.MouseEvent<HTMLDivElement>) => {
    if (e) {
      const target = e.target as HTMLElement;
      if (target.closest('[data-no-detail-click="true"]')) return;
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
        <p className="text-muted-foreground">No hay candidatos para mostrar en el ranking.</p>
        <p className="text-sm text-muted-foreground/80 mt-2">Intenta cargar algunos CVs o ajusta tus filtros.</p>
      </div>
    );
  }

  const sortedCandidates = [...candidates].sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {sortedCandidates.map((candidate, index) => {
          const isSelected = selectedFileNames.includes(candidate.fileName);
          const variant = index === 0 ? 'top' : index === 1 ? 'second' : index === 2 ? 'third' : 'default';

          return (
            <motion.div
              key={candidate.fileName}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
              className={cn(cardVariants({ variant, selected: isSelected }))}
              onClick={(e) => handleCandidateClick(candidate, e)}
            >
              <div 
                data-no-detail-click="true"
                className="absolute top-3 right-3 z-20 p-1"
                onClick={(e) => e.stopPropagation()}
              >
                <Checkbox
                  id={`select-candidate-rank-${candidate.fileName}`}
                  checked={isSelected}
                  onCheckedChange={() => onToggleSelection(candidate.fileName)}
                  className="h-6 w-6 rounded-md border-2 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground transition-all shadow"
                />
              </div>

              <div className="flex items-start gap-4">
                <RankingIcon rank={index} />
                <div className="flex-grow">
                  <div className="flex flex-col sm:flex-row justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-foreground">{candidate.name}</h3>
                      <p className="text-sm text-muted-foreground">{candidate.suggestedRole || 'Rol no determinado'}</p>
                    </div>
                    <div className="text-left sm:text-right mt-2 sm:mt-0">
                      <p className="font-extrabold text-2xl text-primary">{Math.round(candidate.score)}%</p>
                      <p className="text-xs font-medium text-muted-foreground">Compatibilidad</p>
                    </div>
                  </div>

                  <div className="relative pt-1 mt-3">
                    <Progress value={candidate.score} className="h-2" />
                  </div>

                  {candidate.matchedSkills && candidate.matchedSkills.length > 0 && (
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-2">
                        {candidate.matchedSkills.slice(0, 5).map((skill) => (
                          <Badge key={skill} variant="secondary">{skill}</Badge>
                        ))}
                        {candidate.matchedSkills.length > 5 && (
                          <Badge variant="outline">+{candidate.matchedSkills.length - 5}</Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {candidate.suggestionReasoning && (
                    <div className="mt-4 pt-3 border-t border-border/80">
                      <p className="text-sm text-muted-foreground italic p-3 bg-accent/50 rounded-md">
                        <Lightbulb className="h-4 w-4 mr-2 inline-block text-primary/80" />
                        {candidate.suggestionReasoning}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {selectedCandidateDetail && (
        <CandidateDetail 
          candidate={selectedCandidateDetail} 
          isOpen={isDetailOpen} 
          onClose={handleCloseDetail} 
        />
      )}
    </div>
  );
};

export default CandidateRanking;
