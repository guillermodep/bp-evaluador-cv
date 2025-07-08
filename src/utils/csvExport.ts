import Papa from 'papaparse';
import { Candidate } from './evaluationUtils';

/**
 * Exporta la lista de candidatos a un archivo CSV
 * @param candidates Lista de candidatos ordenada
 * @param requiredSkills Lista de habilidades requeridas para el filtrado
 */
export const exportToCSV = (candidates: Candidate[], requiredSkills: string[]) => {
  // Preparar encabezados
  const headers = [
    'Ranking',
    'Nombre',
    'Puntuación',
    'Experiencia (años)',
    'Educación',
    'Rol Sugerido',
    'Seniority',
    ...requiredSkills.map(skill => `Skill: ${skill}`),
    'Habilidades Destacadas'
  ];

  // Preparar filas
  const rows = candidates.map((candidate, index) => {
    const row: Record<string, string | number> = {
      'Ranking': index + 1,
      'Nombre': candidate.name,
      'Puntuación': `${Math.round(candidate.score)}%`,
      'Experiencia (años)': candidate.experience,
      'Educación': candidate.education,
      'Rol Sugerido': candidate.suggestedRole,
      'Seniority': candidate.seniority || 'No especificado',
    };

    // Añadir columnas para las habilidades requeridas
    requiredSkills.forEach(skill => {
      row[`Skill: ${skill}`] = candidate.matchedSkills.includes(skill) ? 'Sí' : 'No';
    });

    // Añadir habilidades destacadas
    row['Habilidades Destacadas'] = candidate.matchedSkills.join(', ');

    return row;
  });

  // Convertir a CSV
  const csv = Papa.unparse({
    fields: headers,
    data: rows
  });

  // Crear blob y descargar
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `candidatos_evaluacion_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
