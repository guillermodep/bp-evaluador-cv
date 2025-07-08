import { Candidate } from './evaluationUtils';

const formatCandidateForATS = (candidate: Candidate): string => {
  return `
## ${candidate.name || 'N/A'}

- **Archivo:** ${candidate.fileName || 'N/A'}
- **Rol Sugerido:** ${candidate.suggestedRole || 'N/A'}
- **Seniority:** ${candidate.seniority || 'N/A'}
- **Puntuación:** ${Math.round(candidate.score)}%
- **Experiencia (años):** ${candidate.experience !== undefined ? candidate.experience : 'N/A'}
- **Educación Principal:** ${candidate.education || 'N/A'}

### Resumen de Experiencia
${candidate.experienceSummary || 'N/A'}

### Formación y Certificaciones
${candidate.educationSummary || 'N/A'}

### Habilidades Destacadas
${candidate.matchedSkills && candidate.matchedSkills.length > 0 ? candidate.matchedSkills.map(skill => `- ${skill}`).join('\n') : 'N/A'}

### Otras Habilidades
${candidate.otherSkills || 'N/A'}

---
  `.trim();
};

export const exportToATSMarkdown = (candidates: Candidate[], requiredSkills: string[] = []) => {
  if (candidates.length === 0) {
    alert('No hay candidatos para exportar.');
    return;
  }

  const markdownContent = candidates.map(formatCandidateForATS).join('\n\n');

  const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  
  let fileName = 'perfiles_candidatos_ATS.md';
  if (requiredSkills.length > 0) {
    const skillsString = requiredSkills.join('_').replace(/[^a-zA-Z0-9_]/g, '');
    fileName = `perfiles_ATS_${skillsString.substring(0,30)}.md`;
  }
  
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  alert('Perfiles exportados a formato Markdown para ATS.');
}; 
