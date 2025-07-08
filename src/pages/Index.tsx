import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; 
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import RoleSeniorityChart from '@/components/RoleSeniorityChart';
import { Candidate, evaluateCVs, filterCandidatesBySkills } from '@/utils/evaluationUtils';
import { Check, LogOut, Plus, Search, SlidersHorizontal, Trash2, UploadCloud, X, FileText, FileDown, BrainCircuit } from 'lucide-react'; 
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import FileUpload from '@/components/FileUpload';
import CandidateRanking from '@/components/CandidateRanking';
import CandidateTable from '@/components/CandidateTable';
import RecentEvaluations from '@/components/RecentEvaluations';
import { exportToCSV } from '@/utils/csvExport'; 
import { exportToPDF } from '@/utils/pdfExport'; 
import { exportToATSMarkdown } from '@/utils/atsExport'; 

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
  const [skillInput, setSkillInput] = useState('');
  const [activeTab, setActiveTab] = useState("ranking");
  const [selectedChartRole, setSelectedChartRole] = useState<string | null>(null);
  const [selectedChartSeniority, setSelectedChartSeniority] = useState<string | null>(null);
  const [selectedForDeletion, setSelectedForDeletion] = useState<string[]>([]); // Estado para candidatos seleccionados

  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

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
          description: `${notProcessedCandidates.length} archivo${notProcessedCandidates.length > 1 ? 's' : ''} no pud${notProcessedCandidates.length > 1 ? 'ieron' : 'o'} ser procesado${notProcessedCandidates.length > 1 ? 's' : ''} correctamente debido a problemas con su estructura. Estos archivos aparecerán en los resultados pero con información limitada.`,
          variant: "default",
          duration: 7000,
        });
      }
      setCandidates(evaluatedCandidates);
    } catch (error: any) {
      console.error('Error evaluating CVs:', error);
      toast({
        title: "Error al procesar archivos",
        description: error.message || 'Hubo un problema al procesar los CVs con Azure AI. Por favor, inténtalo de nuevo.',
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

  const addSkill = () => {
    if (skillInput.trim() && !requiredSkills.includes(skillInput.trim())) {
      setRequiredSkills([...requiredSkills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter(s => s !== skill));
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

      if (!counts[role]) {
        counts[role] = {};
      }
      if (!counts[role][seniority]) {
        counts[role][seniority] = 0;
      }
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

  // Funciones para manejar la selección de candidatos para eliminación (re-añadidas)
  const toggleCandidateSelection = (fileName: string) => {
    setSelectedForDeletion(prevSelected =>
      prevSelected.includes(fileName)
        ? prevSelected.filter(name => name !== fileName)
        : [...prevSelected, fileName]
    );
  };

  const handleDeleteSelectedCandidates = () => {
    if (selectedForDeletion.length === 0) {
      toast({ title: "No hay candidatos seleccionados", variant: "destructive", duration: 3000 });
      return;
    }
    // Usar un modal de confirmación sería mejor, pero por ahora window.confirm
    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar ${selectedForDeletion.length} candidato(s) seleccionados? Esta acción no se puede deshacer.`
    );
    if (confirmDelete) {
      setCandidates(prevCandidates =>
        prevCandidates.filter(candidate => !selectedForDeletion.includes(candidate.fileName))
      );
      const numDeleted = selectedForDeletion.length;
      setSelectedForDeletion([]); // Limpiar la selección después de eliminar
      toast({
        title: "Candidatos Eliminados",
        description: `${numDeleted} candidato${numDeleted > 1 ? 's' : ''} ha${numDeleted > 1 ? 'n' : ''} sido eliminado${numDeleted > 1 ? 's' : ''}.`,
        duration: 3000,
      });
    }
  };

  // Función para seleccionar/deseleccionar todos los candidatos visibles (para la tabla)
  // Se basa en los `filteredCandidates` para que solo afecte a los visibles con los filtros actuales.
  const handleSelectAllVisibleCandidates = (selectAll: boolean) => {
    if (selectAll) {
      setSelectedForDeletion(filteredCandidates.map(c => c.fileName));
    } else {
      setSelectedForDeletion([]);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden py-8">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-sky-100 z-0"></div>
      
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-br from-indigo-300/20 to-purple-300/20 rounded-full blur-3xl float-slow"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-tl from-blue-300/20 to-sky-300/20 rounded-full blur-3xl float-medium"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-gradient-to-tr from-pink-300/20 to-purple-300/20 rounded-full blur-3xl float-fast"></div>
        <div className="absolute bottom-1/4 left-1/3 w-56 h-56 bg-gradient-to-bl from-sky-300/20 to-indigo-300/20 rounded-full blur-3xl float-medium-slow"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <header className="text-center mb-10 pt-8">
          <div className="flex justify-end mb-4">
            <Button variant="outline" onClick={handleLogout} className="bg-white/50 hover:bg-white/80 border-indigo-200 text-indigo-700 text-sm">
              <LogOut size={16} className="mr-2" />
              Cerrar Sesión
            </Button>
          </div>
          {/* Icono y Título Principal Modificados */}
          <div className="inline-block p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4">
            <BrainCircuit className="w-10 h-10 text-white" /> {/* Nuevo Icono */}
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text inline-block">
            Analizador Inteligente de CVs {/* Nuevo Título */}
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mx-auto mb-4"></div> {/* Línea un poco más ancha */}
          <p className="text-gray-600 max-w-2xl mx-auto mb-6"> 
            Sube los CVs en formato Word o PDF. Nuestra IA los analizará y rankeará para ayudarte a encontrar el mejor talento TI.
          </p>
          {isLoading && (
            <div className="mt-6 w-full max-w-md mx-auto">
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
        </header>

        <div className="grid gap-8">
          {candidates.length === 0 && !isLoading ? ( 
            <>
              <section className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-white/20">
                <FileUpload onFilesUploaded={handleFilesUploaded} />
              </section>
              <section className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-white/20">
                <h2 className="text-xl font-bold mb-6 text-gray-800">Evaluaciones Recientes</h2>
                <RecentEvaluations />
              </section>
            </>
          ) : (
            <>
              <section className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 sm:p-8 border border-white/20">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Resultados de Evaluación</h2>
                    {candidates.length > 0 && (
                      <p className="text-sm text-gray-600 mt-1">
                        Mostrando {filteredCandidates.length} de {candidates.length} perfiles procesados.
                        {selectedForDeletion.length > 0 && (
                          <span className="ml-1 font-medium text-indigo-600">
                            ({selectedForDeletion.length} seleccionados)
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-3 sm:mt-0">
                    {selectedForDeletion.length > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteSelectedCandidates}
                        className="flex items-center gap-1.5"
                      >
                        <Trash2 size={15} />
                        Eliminar ({selectedForDeletion.length})
                      </Button>
                    )}
                    <Button 
                      onClick={() => { 
                        setCandidates([]);
                        setRequiredSkills([]);
                        setSelectedChartRole(null);
                        setSelectedChartSeniority(null);
                        setSelectedForDeletion([]); // Limpiar selección también
                      }} 
                      variant="default" 
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M15.312 5.312a.75.75 0 0 1 0 1.061L11.873 9.812a.75.75 0 0 1-1.061 0L7.373 6.373a.75.75 0 0 1 0-1.061L10.812 1.873a.75.75 0 0 1 1.061 0l3.439 3.439ZM3 8.25a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5h-6A.75.75 0 0 1 3 8.25Zm0 3.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 0 1.5h-3a.75.75 0 0 1-.75-.75Zm0 3.5a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5h-6a.75.75 0 0 1-.75-.75Zm13.28-6.03a.75.75 0 0 0-1.06-1.06l-1.47 1.47a.75.75 0 1 0 1.06 1.06l1.47-1.47Zm-1.06 3.182a.75.75 0 0 0-1.06-1.06l-1.47 1.47a.75.75 0 1 0 1.06 1.06l1.47-1.47Z" clipRule="evenodd" />
                        <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      Nueva Evaluación
                    </Button>
                  </div>
                </div>

                <Card className="mb-8 p-6 bg-indigo-50/30 border border-indigo-200 rounded-xl shadow-lg">
                  <CardHeader className="p-0 pb-4 mb-4 border-b border-indigo-100">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <div className="mb-3 sm:mb-0">
                        <CardTitle className="text-xl font-semibold text-indigo-800 flex items-center">
                          <SlidersHorizontal size={20} className="mr-2 text-indigo-600" />
                          Filtros de Búsqueda Avanzados
                        </CardTitle>
                        <CardDescription className="text-sm text-indigo-700/80 mt-1">
                          Optimiza tu búsqueda añadiendo criterios específicos como habilidades, experiencia, etc.
                        </CardDescription>
                      </div>
                      {requiredSkills.length > 0 && (
                        <Button variant="outline" size="sm" onClick={() => setRequiredSkills([])} className="text-xs text-indigo-700 border-indigo-300 hover:bg-indigo-100">
                          <Trash2 size={14} className="mr-1.5" />
                          Limpiar Filtros ({requiredSkills.length})
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="flex items-center gap-3 mb-4">
                      <Input
                        type="text"
                        value={skillInput}
                        placeholder="Añade un criterio y presiona Enter o clic en 'Añadir' (ej: React, Python, Liderazgo)"
                        className="flex-grow text-base py-3 px-4 border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500"
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault(); 
                            addSkill();
                          }
                        }}
                      />
                      <Button 
                        onClick={addSkill} 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-5 text-base"
                        disabled={!skillInput.trim()}
                      >
                        <Plus size={18} className="mr-1.5 sm:mr-2" />
                        Añadir Criterio
                      </Button>
                    </div>

                    <div className="min-h-[40px] p-3 bg-white/50 rounded-lg border border-dashed border-indigo-300 flex flex-wrap gap-2 items-center">
                      {requiredSkills.length > 0 ? (
                        requiredSkills.map(skill => (
                          <Badge key={skill} variant="secondary" className="text-sm pl-3 pr-2 py-1.5 bg-indigo-100 text-indigo-800 hover:bg-indigo-200 border border-indigo-300 shadow-sm flex items-center gap-1.5">
                            {skill}
                            <button onClick={() => removeSkill(skill)} className="hover:text-red-500 transition-colors rounded-full p-0.5">
                              <X size={14} />
                            </button>
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 w-full text-center">Los criterios que añadas aparecerán aquí.</p>
                      )}
                    </div>
                    
                    {/* Sección del gráfico - Reintroducida debajo de los filtros de habilidad */}
                    {candidates.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-indigo-200">
                        <h3 className="text-md font-semibold text-gray-700 mb-3 text-center sm:text-left">Distribución de Roles y Seniority (Resultados Filtrados)</h3>
                        <div className="h-[350px] sm:h-[400px]"> {/* Contenedor con altura para el gráfico */}
                          <RoleSeniorityChart 
                            data={roleSeniorityChartData} 
                            onFilterChange={handleChartFilterChange} 
                            selectedRole={selectedChartRole}
                            selectedSeniority={selectedChartSeniority}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card> 

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-indigo-100/70 rounded-lg mb-1">
                    <TabsTrigger value="ranking" className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700">Ranking</TabsTrigger>
                    <TabsTrigger value="table" className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700">Tabla</TabsTrigger>
                  </TabsList>
                  
                  {/* Botones de Exportación encima de las pestañas */}
                  {filteredCandidates.length > 0 && (
                    <div className="flex justify-end gap-2 my-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-indigo-200"
                        onClick={() => exportToCSV(filteredCandidates, requiredSkills)}
                        title="Exportar candidatos visibles a CSV"
                      >
                        <FileText className="h-4 w-4" />
                        CSV
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-indigo-200"
                        onClick={() => {
                          console.log("Exportando a PDF - filteredCandidates:", filteredCandidates);
                          console.log("Exportando a PDF - requiredSkills:", requiredSkills);
                          exportToPDF(filteredCandidates, requiredSkills);
                        }}
                        title="Exportar candidatos visibles a PDF"
                      >
                        <FileDown className="h-4 w-4" />
                        PDF
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-indigo-200"
                        onClick={() => exportToATSMarkdown(filteredCandidates)}
                        title="Exportar candidatos visibles a Markdown (ATS)"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.121A1.5 1.5 0 0 1 17 6.621V16.5a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 16.5v-13Z" />
                          <path d="M4.5 6A1.5 1.5 0 0 0 3 7.5v10A1.5 1.5 0 0 0 4.5 19h7a1.5 1.5 0 0 0 1.5-1.5v-1.5a.75.75 0 0 0-1.5 0V17.5a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5H6a.75.75 0 0 0 0-1.5H4.5Z" />
                        </svg>
                        ATS
                      </Button>
                    </div>
                  )}

                  <TabsContent value="ranking">
                    <div className="grid md:grid-cols-1 gap-6"> 
                      <CandidateRanking 
                        candidates={filteredCandidates} 
                        selectedFileNames={selectedForDeletion} // Pasar prop
                        onToggleSelection={toggleCandidateSelection} // Pasar prop
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="table">
                    <CandidateTable 
                      candidates={filteredCandidates} 
                      requiredSkills={requiredSkills} 
                      selectedFileNames={selectedForDeletion} // Pasar prop
                      onToggleSelection={toggleCandidateSelection} // Pasar prop
                      onSelectAll={handleSelectAllVisibleCandidates} // Pasar prop
                      areAllVisibleSelected={ // Pasar prop
                        filteredCandidates.length > 0 && 
                        filteredCandidates.every(c => selectedForDeletion.includes(c.fileName))
                      }
                    /> 
                  </TabsContent>
                </Tabs>
              </section>
            </>
          )}
        </div>

        {isLoading && totalFiles > 0 && (
          <div className="fixed inset-0 bg-gray-800/70 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
              <div className="text-center">
                <div className="mb-4 bg-indigo-50 p-2 rounded-full inline-block">
                  <svg className="w-10 h-10 text-indigo-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="2" width="24" height="28" rx="2" fill="currentColor" />
                    <rect x="8" y="8" width="16" height="2" rx="1" fill="white" />
                    <rect x="8" y="12" width="16" height="2" rx="1" fill="white" />
                    <rect x="8" y="16" width="10" height="2" rx="1" fill="white" />
                    <path d="M22 24L24.2 19.8L28 18.4L25 15.2L25.6 11.2L22 12.8L18.4 11.2L19 15.2L16 18.4L19.8 19.8L22 24Z" fill="#FBBF24" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold mb-2">Procesando con Azure OpenAI</h2>
                
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 dark:bg-gray-700">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                  {processedFiles} de {totalFiles} archivos procesados ({progress}%)
                </p>
                
                {currentProcessingFile && (
                  <p className="text-xs text-gray-500 mt-1 text-center truncate">
                    Analizando: {currentProcessingFile}
                  </p>
                )}
              </div>
              <div className="mt-6 text-xs text-gray-400">
                <p>Por favor, espera mientras analizamos los CVs...</p>
                <p className="mt-2">Puedes ver el progreso de cada archivo en la consola del navegador (F12).</p>
              </div>
            </div>
          </div>
        )}

        <Toaster />
      </div>
    </div>
  );
};

export default Index;
