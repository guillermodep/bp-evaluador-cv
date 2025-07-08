import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Candidate, evaluateCVs, filterCandidatesBySkills } from '@/utils/evaluationUtils';
import { Trash2, FileText, FileDown } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import FileUpload from '@/components/FileUpload';
import CandidateRanking from '@/components/CandidateRanking';
import CandidateTable from '@/components/CandidateTable';
import RecentEvaluations from '@/components/RecentEvaluations';
import { exportToCSV } from '@/utils/csvExport';
import { exportToPDF } from '@/utils/pdfExport';
import { exportToATSMarkdown } from '@/utils/atsExport';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';

interface ChartDataPoint {
  role: string;
  [seniority: string]: number | string;
}

const Index = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [processedFiles, setProcessedFiles] = useState(0);
  const [currentProcessingFile, setCurrentProcessingFile] = useState<string | null>(null);
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("ranking");
  const [selectedChartRole, setSelectedChartRole] = useState<string | null>(null);
  const [selectedChartSeniority, setSelectedChartSeniority] = useState<string | null>(null);
  const [selectedForDeletion, setSelectedForDeletion] = useState<string[]>([]);

  const { toast } = useToast();

  const updateProgress = (processed: number, total: number, fileName?: string) => {
    setProcessedFiles(processed);
    setTotalFiles(total);
    const progressPercentage = Math.round((processed / total) * 100);
    setProgress(progressPercentage);
    if (fileName) {
      setCurrentProcessingFile(fileName);
    }
  };

  const handleFilesUploaded = async (files: File[]) => {
    setIsLoading(true);
    setProgress(0);
    setTotalFiles(files.length);
    setProcessedFiles(0);
    setCurrentProcessingFile(files.length > 0 ? files[0].name : null);

    try {
      const evaluatedCandidates = await evaluateCVs(files, updateProgress);
      
      const notProcessedCandidates = evaluatedCandidates.filter(candidate => 
        candidate.experienceSummary?.includes('[ARCHIVO NO PROCESADO]')
      );

      if (notProcessedCandidates.length > 0) {
        const totalFilesCount = files.length;
        const processedFilesCount = evaluatedCandidates.length - notProcessedCandidates.length;
        toast({
          title: `Procesamiento parcial (${processedFilesCount}/${totalFilesCount})`,
          description: `${notProcessedCandidates.length} archivo${notProcessedCandidates.length > 1 ? 's' : ''} no pud${notProcessedCandidates.length > 1 ? 'ieron' : 'o'} ser procesado${notProcessedCandidates.length > 1 ? 's' : ''} correctamente.`,
          variant: "default",
          duration: 7000,
        });
      }
      setCandidates(evaluatedCandidates);
    } catch (error: any) {
      console.error('Error evaluating CVs:', error);
      toast({
        title: "Error al procesar archivos",
        description: error.message || 'Hubo un problema al procesar los CVs.',
        variant: "destructive",
        duration: 5000,
      });
      setCandidates([]);
    } finally {
      setIsLoading(false);
      setProgress(100);
      setCurrentProcessingFile(null);
    }
  };

  const candidatesFilteredBySkills = useMemo(() => {
    if (requiredSkills.length > 0) {
      return filterCandidatesBySkills(candidates, requiredSkills);
    }
    return candidates;
  }, [candidates, requiredSkills]);

  const roleSeniorityChartData = useMemo(() => {
    if (candidatesFilteredBySkills.length === 0) return [];

    const counts: { [role: string]: { [seniority: string]: number } } = {};
    const allSeniorities = new Set<string>();

    candidatesFilteredBySkills.forEach(candidate => {
      const role = candidate.suggestedRole || 'No Determinado';
      const seniority = candidate.seniority || 'No Especificado';
      allSeniorities.add(seniority);

      if (!counts[role]) counts[role] = {};
      if (!counts[role][seniority]) counts[role][seniority] = 0;
      counts[role][seniority]++;
    });

    return Object.entries(counts).map(([role, seniorityCounts]) => {
      const dataPoint: ChartDataPoint = { role };
      allSeniorities.forEach(s => {
        dataPoint[s] = seniorityCounts[s] || 0;
      });
      return dataPoint;
    });
  }, [candidatesFilteredBySkills]);

  const filteredCandidates = useMemo(() => {
    let result = candidatesFilteredBySkills;

    if (selectedChartRole) {
      result = result.filter(c => c.suggestedRole === selectedChartRole);
    }
    if (selectedChartRole && selectedChartSeniority) {
      result = result.filter(c => c.seniority === selectedChartSeniority);
    }
    else if (!selectedChartRole && selectedChartSeniority) {
      result = result.filter(c => c.seniority === selectedChartSeniority);
    }
    return result;
  }, [candidatesFilteredBySkills, selectedChartRole, selectedChartSeniority]);

  const handleChartFilterChange = (role: string | null, seniority: string | null) => {
    if (selectedChartRole === role && selectedChartSeniority === seniority) {
      setSelectedChartRole(null);
      setSelectedChartSeniority(null);
    } else if (selectedChartRole === role && seniority === null) {
      setSelectedChartRole(null);
      setSelectedChartSeniority(null);
    } else {
      setSelectedChartRole(role);
      setSelectedChartSeniority(seniority);
    }
  };

  const toggleCandidateSelection = (fileName: string) => {
    setSelectedForDeletion(prev =>
      prev.includes(fileName)
        ? prev.filter(name => name !== fileName)
        : [...prev, fileName]
    );
  };

  const handleDeleteSelectedCandidates = () => {
    if (selectedForDeletion.length === 0) return;
    const confirmDelete = window.confirm(`¿Eliminar ${selectedForDeletion.length} candidato(s)?`);
    if (confirmDelete) {
      setCandidates(prev => prev.filter(c => !selectedForDeletion.includes(c.fileName)));
      setSelectedForDeletion([]);
      toast({ title: `${selectedForDeletion.length} candidato(s) eliminado(s).` });
    }
  };

  const handleSelectAllVisibleCandidates = (selectAll: boolean) => {
    setSelectedForDeletion(selectAll ? filteredCandidates.map(c => c.fileName) : []);
  };

  const handleNewEvaluation = () => {
    setCandidates([]);
    setRequiredSkills([]);
    setSelectedChartRole(null);
    setSelectedChartSeniority(null);
    setSelectedForDeletion([]);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        requiredSkills={requiredSkills}
        setRequiredSkills={setRequiredSkills}
        roleSeniorityChartData={roleSeniorityChartData}
        handleChartFilterChange={handleChartFilterChange}
        selectedChartRole={selectedChartRole}
        selectedChartSeniority={selectedChartSeniority}
        hasCandidates={candidates.length > 0}
      />
      <div className="flex flex-col flex-1 w-full">
        <Header />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {isLoading && (
              <div className="w-full max-w-2xl mx-auto my-10">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-indigo-700">{currentProcessingFile ? `Analizando: ${currentProcessingFile}` : 'Preparando...'}</span>
                  <span className="text-sm font-medium text-indigo-700">{progress}%</span>
                </div>
                <Progress value={progress} className="w-full h-2.5 bg-indigo-100" />
                {totalFiles > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {processedFiles} de {totalFiles} archivos procesados
                  </p>
                )}
              </div>
            )}

            {!isLoading && candidates.length === 0 && (
              <div className="grid gap-8 mt-4">
                <section className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-white/20">
                  <FileUpload onFilesUploaded={handleFilesUploaded} />
                </section>
                <section className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-white/20">
                  <h2 className="text-xl font-bold mb-6 text-gray-800">Evaluaciones Recientes</h2>
                  <RecentEvaluations />
                </section>
              </div>
            )}

            {!isLoading && candidates.length > 0 && (
              <section>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Resultados de Evaluación</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Mostrando {filteredCandidates.length} de {candidates.length} perfiles procesados.
                      {selectedForDeletion.length > 0 && (
                        <span className="ml-1 font-medium text-indigo-600">({selectedForDeletion.length} seleccionados)</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-3 sm:mt-0">
                    {selectedForDeletion.length > 0 && (
                      <Button variant="destructive" size="sm" onClick={handleDeleteSelectedCandidates} className="flex items-center gap-1.5">
                        <Trash2 size={15} />
                        Eliminar ({selectedForDeletion.length})
                      </Button>
                    )}
                    <Button onClick={handleNewEvaluation} variant="default" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-600 text-white font-semibold">
                      Nueva Evaluación
                    </Button>
                  </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <div className="flex justify-between items-center mb-4">
                    <TabsList>
                      <TabsTrigger value="ranking">Ranking de Candidatos</TabsTrigger>
                      <TabsTrigger value="table">Vista de Tabla</TabsTrigger>
                    </TabsList>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => exportToCSV(filteredCandidates, requiredSkills)}>
                        <FileText size={14} className="mr-2"/>
                        Exportar CSV
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => exportToPDF(filteredCandidates, requiredSkills)}>
                        <FileDown size={14} className="mr-2"/>
                        Exportar PDF
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => exportToATSMarkdown(filteredCandidates)}>
                        <FileText size={14} className="mr-2"/>
                        Exportar ATS
                      </Button>
                    </div>
                  </div>
                  <TabsContent value="ranking">
                    <CandidateRanking 
                        candidates={filteredCandidates} 
                        selectedFileNames={selectedForDeletion}
                        onToggleSelection={toggleCandidateSelection}
                      />
                  </TabsContent>
                  <TabsContent value="table">
                    <CandidateTable 
                      candidates={filteredCandidates} 
                      requiredSkills={requiredSkills}
                      selectedFileNames={selectedForDeletion}
                      onToggleSelection={toggleCandidateSelection}
                      onSelectAll={handleSelectAllVisibleCandidates}
                      areAllVisibleSelected={
                        filteredCandidates.length > 0 &&
                        filteredCandidates.every(c => selectedForDeletion.includes(c.fileName))
                      }
                    />
                  </TabsContent>
                </Tabs>
              </section>
            )}
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
};

export default Index;
