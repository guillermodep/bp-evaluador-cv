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

interface CandidateTableProps {
  candidates: Candidate[];
  requiredSkills: string[];
  selectedFileNames: string[]; 
  onToggleSelection: (fileName: string) => void; 
  onSelectAll: (selectAll: boolean) => void; 
  areAllVisibleSelected: boolean; 
}

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
      return sortConfig.direction === 'ascending' ? <ArrowUpDown size={14} className="ml-1 inline text-indigo-600" /> : <ArrowUpDown size={14} className="ml-1 inline text-indigo-600 transform rotate-180" />;
    }
    return <ArrowUpDown size={14} className="ml-1 inline opacity-40 group-hover:opacity-100" />;
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
        <p className="text-gray-500">No hay candidatos para mostrar en la tabla.</p>
        <p className="text-sm text-gray-400 mt-2">Intenta cargar algunos CVs o ajusta tus filtros.</p>
      </div>
    );
  }

  return (
    <Card className="shadow-none border-none bg-transparent">
      <div className="overflow-x-auto">
        <Table className="min-w-full divide-y divide-gray-200">
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="px-4 py-3 w-12" data-checkbox-cell="true">
                <Checkbox 
                  id="select-all-table"
                  checked={areAllVisibleSelected}
                  onCheckedChange={(checked) => onSelectAll(Boolean(checked))}
                  aria-label="Seleccionar todos los candidatos visibles"
                  className="h-5 w-5 rounded border-gray-400 data-[state=checked]:bg-indigo-600 data-[state=checked]:text-white transition-all duration-150 ease-in-out shadow"
                />
              </TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider group cursor-pointer" onClick={() => requestSort('name')}>
                Nombre {getSortIndicator('name')}
              </TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider group cursor-pointer" onClick={() => requestSort('score')}>
                Score {getSortIndicator('score')}
              </TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider group cursor-pointer" onClick={() => requestSort('suggestedRole')}>
                Rol Sugerido {getSortIndicator('suggestedRole')}
              </TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider group cursor-pointer" onClick={() => requestSort('seniority')}>
                Seniority {getSortIndicator('seniority')}
              </TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider group cursor-pointer" onClick={() => requestSort('experience')}>
                Experiencia (años) {getSortIndicator('experience')}
              </TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Habilidades Clave
              </TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white divide-y divide-gray-200">
            {sortedCandidates.map((candidate) => (
              <TableRow 
                key={candidate.fileName} 
                className={`transition-colors hover:bg-slate-100/80 ${selectedFileNames.includes(candidate.fileName) ? 'bg-indigo-50/70 hover:bg-indigo-100/70' : ''}`}
                onClick={(e) => handleViewDetails(candidate, e)} 
              >
                <TableCell className="px-4 py-3" data-checkbox-cell="true" onClick={(e) => e.stopPropagation()}>
                  <Checkbox 
                    id={`select-candidate-table-${candidate.fileName}`}
                    checked={selectedFileNames.includes(candidate.fileName)}
                    onCheckedChange={() => onToggleSelection(candidate.fileName)}
                    aria-label={`Seleccionar ${candidate.name}`}
                    className="h-5 w-5 rounded border-gray-400 data-[state=checked]:bg-indigo-600 data-[state=checked]:text-white transition-all duration-150 ease-in-out shadow"
                  />
                </TableCell>
                <TableCell className="px-4 py-3 whitespace-nowrap cursor-pointer">
                  <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                  <div className="text-xs text-gray-500">{candidate.fileName}</div>
                </TableCell>
                <TableCell className="px-4 py-3 whitespace-nowrap cursor-pointer">
                  <Badge variant={candidate.score > 75 ? "default" : candidate.score > 50 ? "secondary" : "outline"} className={`${candidate.score > 75 ? 'bg-green-100 text-green-700' : candidate.score > 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                    {Math.round(candidate.score)}%
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-sm text-gray-700 cursor-pointer">{candidate.suggestedRole}</TableCell>
                <TableCell className="px-4 py-3 text-sm text-gray-700 cursor-pointer">{candidate.seniority || 'N/A'}</TableCell>
                <TableCell className="px-4 py-3 text-sm text-gray-700 text-center cursor-pointer">{candidate.experience}</TableCell>
                <TableCell className="px-4 py-3 cursor-pointer">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {candidate.matchedSkills.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="bg-indigo-50 text-indigo-700 text-xs font-normal">
                        {skill}
                      </Badge>
                    ))}
                    {candidate.matchedSkills.length > 3 && (
                      <Badge variant="outline" className="text-indigo-600 border-indigo-200 text-xs">
                        +{candidate.matchedSkills.length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 whitespace-nowrap">
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleViewDetails(candidate);}} className="text-indigo-600 hover:text-indigo-800">
                    <Eye size={16} className="mr-1" /> Ver
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
