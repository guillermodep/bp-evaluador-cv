// This would typically involve real AI analysis of CV text
// For now, we'll simulate the evaluation with mock data

export interface Candidate {
  name: string;
  score: number;
  experience: number;
  education: string;
  experienceSummary?: string;
  educationSummary?: string;
  otherSkills?: string;
  matchedSkills: string[];
  missingSkills: string[];
  suggestedRole: string;
  seniority?: string;
  fileName: string;
  suggestionReasoning?: string; // Nuevo campo para el razonamiento
}

// Esta lista se mantiene porque se utiliza en el componente RoleSuggestion.tsx
export const popularITRoles = [
  // Roles de Desarrollo
  "Desarrollador Frontend",
  "Desarrollador Backend",
  "Full Stack Developer",
  "Mobile Developer",
  
  // Roles de Operaciones e Infraestructura
  "DevOps Engineer",
  "SRE (Site Reliability Engineer)",
  "Cloud Architect",
  "Administrador de Sistemas",
  "Administrador de Base de Datos",
  
  // Roles de Monitoreo y Observabilidad
  "Ingeniero de Observabilidad",
  "Especialista en Monitoreo de Aplicaciones",
  "Analista de Performance",
  "Ingeniero de Monitoreo y Alertas",
  "Especialista en APM (Application Performance Monitoring)",
  "Ingeniero de Plataforma de Observabilidad",
  "Consultor de Dynatrace",
  "Ingeniero de Monitoreo Cloud",
  "Analista de Telemetría",
  
  // Roles de Datos y Análisis
  "Data Scientist",
  "Ingeniero de Machine Learning",
  "Analista de Datos",
  
  // Roles de Calidad y Seguridad
  "Ingeniero QA",
  "Especialista en Ciberseguridad",
  
  // Roles de Diseño y Producto
  "UX/UI Designer",
  "Scrum Master",
  "Product Owner",
  "Arquitecto de Software"
];

// Ya no necesitamos esta lista ya que no generamos datos simulados

// Ya no necesitamos esta lista ya que no generamos datos simulados

// Importar el servicio de Azure AI
import { evaluateCVsWithAzure } from './azureAIService';

// Tipo para la función de actualización de progreso
export type ProgressUpdateFunction = (processed: number, total: number, currentFileName?: string) => void;

// Evaluar CVs usando Azure AI Services
export const evaluateCVs = async (files: File[], onProgressUpdate?: ProgressUpdateFunction): Promise<Candidate[]> => {
  try {
    // Usar el servicio de Azure AI para evaluar los CVs
    const candidates = await evaluateCVsWithAzure(files, onProgressUpdate);
    return candidates;
  } catch (error) {
    console.error('Error al evaluar los CVs con Azure AI:', error);
    // Propagar el error para que se muestre al usuario
    throw new Error(`Error al evaluar los CVs con Azure AI: ${error.message}. Por favor, inténtalo de nuevo.`);
  }
};

// Filter candidates based on required skills or text in their profile
export const filterCandidatesBySkills = (candidates: Candidate[], requiredSkills: string[]): Candidate[] => {
  if (requiredSkills.length === 0) return candidates;
  
  return candidates.filter(candidate => {
    // Para cada habilidad requerida, verificar si aparece en alguna de las secciones relevantes
    const matchedSkills = requiredSkills.filter(skill => {
      const skillLower = skill.toLowerCase();
      
      // Verificar en habilidades destacadas (matchedSkills)
      if (candidate.matchedSkills.some(s => s.toLowerCase().includes(skillLower))) {
        return true;
      }
      
      // Verificar en resumen de experiencia
      if (candidate.experienceSummary && 
          candidate.experienceSummary.toLowerCase().includes(skillLower)) {
        return true;
      }
      
      // Verificar en formación y certificaciones
      if (candidate.educationSummary && 
          candidate.educationSummary.toLowerCase().includes(skillLower)) {
        return true;
      }
      
      // Verificar en otras habilidades
      if (candidate.otherSkills && 
          candidate.otherSkills.toLowerCase().includes(skillLower)) {
        return true;
      }
      
      return false;
    });
    
    // Considerar que un candidato coincide si tiene al menos una habilidad requerida
    // o si tiene al menos el 40% de las habilidades requeridas
    return matchedSkills.length > 0 && matchedSkills.length >= requiredSkills.length * 0.4;
  });
};
