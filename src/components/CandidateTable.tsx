import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Eye } from 'lucide-react';
import { Candidate } from '@/utils/evaluationUtils';
import CandidateDetail from './CandidateDetail';
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from '@/lib/utils';

interface CandidateTableProps {
  candidates: Candidate[];
  requiredSkills: string[];
  selectedFileNames: string[];
  onToggleSelection: (fileName: string) => void;
  onSelectAll: (selectAll: boolean) => void;
  areAllVisibleSelected: boolean;
}

const ScoreBadge = ({ score }: { score: number }) => {
  const scoreColor = score > 75 ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                   : score > 50 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
                   : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
  return (
    <Badge variant="outline" className={cn("font-bold border-none", scoreColor)}>
      {Math.round(score)}%
    </Badge>
  );
};

const CandidateTable = ({ 
  candidates, 
  requiredSkills, 
  selectedFileNames, 
  onToggleSelection, 
  onSelectAll,
  areAllVisibleSelected 
}: CandidateTableProps) => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof Candidate | null; direction: 'ascending' | 'descending' }>({ key: 'score', direction: 'descending' });
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState<Candidate | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const sortedCandidates = useMemo(() => {
    let sortableCandidates = [...candidates];
    if (sortConfig.key) {
      sortableCandidates.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        if (aValue === undefined && bValue === undefined) return 0;
        if (aValue === undefined) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (bValue === undefined) return sortConfig.direction === 'ascending' ? 1 : -1;

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
        } else if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        return 0;
      });
    }
    return sortableCandidates;
  }, [candidates, sortConfig]);

  const requestSort = (key: keyof Candidate) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: keyof Candidate) => {
    if (sortConfig.key === key) {
      return <ArrowUpDown size={14} className="ml-1 inline text-primary" />;
    }
    return <ArrowUpDown size={14} className="ml-1 inline text-muted-foreground/50 group-hover:text-muted-foreground" />;
  };

  const handleViewDetails = (candidate: Candidate, e?: React.MouseEvent<HTMLTableRowElement | HTMLTableCellElement>) => {
    if (e) {
      const target = e.target as HTMLElement;
      if (target.closest('[data-checkbox-cell="true"]')) {
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
        <p className="text-muted-foreground">No hay candidatos para mostrar en la tabla.</p>
        <p className="text-sm text-muted-foreground/80 mt-2">Intenta cargar algunos CVs o ajusta tus filtros.</p>
      </div>
    );
  }

  return (
    <Card className="shadow-none border-none bg-transparent">
      <div className="overflow-x-auto rounded-lg border">
        <Table className="min-w-full">
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="px-4 py-3 w-12" data-checkbox-cell="true">
                <Checkbox 
                  id="select-all-table"
                  checked={areAllVisibleSelected}
                  onCheckedChange={(checked) => onSelectAll(Boolean(checked))}
                  aria-label="Seleccionar todos los candidatos visibles"
                  className="h-5 w-5 rounded border-muted-foreground/50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground transition-all shadow"
                />
              </TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider group cursor-pointer" onClick={() => requestSort('name')}>
                Nombre {getSortIndicator('name')}
              </TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider group cursor-pointer" onClick={() => requestSort('score')}>
                Score {getSortIndicator('score')}
              </TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider group cursor-pointer" onClick={() => requestSort('suggestedRole')}>
                Rol Sugerido {getSortIndicator('suggestedRole')}
              </TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider group cursor-pointer" onClick={() => requestSort('seniority')}>
                Seniority {getSortIndicator('seniority')}
              </TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider group cursor-pointer" onClick={() => requestSort('experience')}>
                Experiencia (años) {getSortIndicator('experience')}
              </TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Habilidades Clave
              </TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border">
            {sortedCandidates.map((candidate) => (
              <TableRow 
                key={candidate.fileName} 
                className={cn("transition-colors duration-200 cursor-pointer", selectedFileNames.includes(candidate.fileName) ? 'bg-primary/10 hover:bg-primary/20' : 'hover:bg-muted/50')}
                onClick={(e) => handleViewDetails(candidate, e)} 
              >
                <TableCell className="px-4 py-3" data-checkbox-cell="true" onClick={(e) => e.stopPropagation()}>
                  <Checkbox 
                    id={`select-candidate-table-${candidate.fileName}`}
                    checked={selectedFileNames.includes(candidate.fileName)}
                    onCheckedChange={() => onToggleSelection(candidate.fileName)}
                    aria-label={`Seleccionar ${candidate.name}`}
                    className="h-5 w-5 rounded border-muted-foreground/50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground transition-all shadow"
                  />
                </TableCell>
                <TableCell className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-semibold text-foreground">{candidate.name}</div>
                  <div className="text-xs text-muted-foreground">{candidate.fileName}</div>
                </TableCell>
                <TableCell className="px-4 py-3 whitespace-nowrap">
                  <ScoreBadge score={candidate.score} />
                </TableCell>
                <TableCell className="px-4 py-3 text-sm text-foreground">{candidate.suggestedRole}</TableCell>
                <TableCell className="px-4 py-3 text-sm text-foreground">{candidate.seniority || 'N/A'}</TableCell>
                <TableCell className="px-4 py-3 text-sm text-foreground text-center">{candidate.experience}</TableCell>
                <TableCell className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5 max-w-xs">
                    {candidate.matchedSkills.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="secondary">{skill}</Badge>
                    ))}
                    {candidate.matchedSkills.length > 3 && (
                      <Badge variant="outline">+{candidate.matchedSkills.length - 3}</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 whitespace-nowrap">
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleViewDetails(candidate);}} className="text-primary hover:text-primary/80">
                    <Eye size={16} className="mr-1.5" /> Ver Detalles
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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

export default CandidateTable;
