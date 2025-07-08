import jsPDF from 'jspdf';
import { Candidate } from './evaluationUtils';

/**
 * Exporta la lista de candidatos a un archivo PDF
 * @param candidates Lista de candidatos ordenada
 * @param requiredSkills Lista de habilidades requeridas para el filtrado
 */
export const exportToPDF = (candidates: Candidate[], requiredSkills: string[]) => {
  // Crear documento PDF
  const doc = new jsPDF();
  
  // Configurar fuentes y estilos
  const titleFontSize = 16;
  const subtitleFontSize = 14;
  const normalFontSize = 10;
  const smallFontSize = 8;
  
  // Añadir título
  doc.setFontSize(titleFontSize);
  doc.setTextColor(75, 85, 99); // text-gray-600
  doc.text('Evaluación de Candidatos TI', 14, 20, { align: 'left' });
  
  // Añadir fecha
  doc.setFontSize(normalFontSize);
  doc.setTextColor(107, 114, 128); // text-gray-500
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 28, { align: 'left' });
  
  // Crear tabla manualmente
  let yPosition = 40;
  
  // Encabezados de la tabla
  const headers = [
    'Ranking',
    'Nombre',
    'Puntuación',
    'Experiencia',
    'Rol Sugerido',
    'Seniority'
  ];
  
  // Añadir habilidades requeridas a los encabezados
  if (requiredSkills.length > 0) {
    headers.push('Habilidades');
  }
  
  // Configurar encabezados
  doc.setFillColor(79, 70, 229); // bg-indigo-600
  doc.setTextColor(255, 255, 255); // text-white
  doc.setFontSize(normalFontSize);
  doc.setFont(undefined, 'bold');
  
  // Dibujar fondo del encabezado
  doc.rect(14, yPosition - 5, 180, 10, 'F');
  
  // Posiciones X para cada columna - Ajustar dinámicamente
  let colPositions = [14, 30, 90, 110, 130, 160]; // Posiciones base para 6 columnas
  if (requiredSkills.length > 0) {
    // Si hay habilidades, se añade una posición para la séptima columna
    // y se ajusta el ancho de las anteriores si es necesario, o se define una nueva posición.
    // Por simplicidad, añadiremos una posición. Considerar ajustar anchos si se superponen.
    colPositions = [14, 30, 80, 100, 120, 145, 170]; // Ajustadas para 7 columnas
    // O, si se quiere mantener el ancho de las primeras y solo añadir la última:
    // colPositions = [14, 30, 90, 110, 130, 160, 180]; // Esto podría hacer que la última columna se salga si el papel es A4 portrait (ancho ~210)
    // Vamos a usar un conjunto de posiciones ajustadas para 7 columnas para mejor distribución:
    // Ranking | Nombre (ancho) | Score | Exp | Rol | Seniority | Habilidades
    //   14    |      30        |  80   | 100 | 120 |    145    |   170
  }
  
  // Dibujar encabezados
  headers.forEach((header, index) => {
    // Asegurarse de que el índice no exceda la longitud de colPositions
    if (index < colPositions.length) {
      doc.text(header, colPositions[index], yPosition, { align: 'left' });
    }
  });
  
  yPosition += 10;
  
  // Configurar estilo para datos
  doc.setTextColor(75, 85, 99); // text-gray-600
  doc.setFont(undefined, 'normal');
  
  // Dibujar filas de datos
  candidates.forEach((candidate, index) => {
    // Verificar si necesitamos una nueva página
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Alternar colores de fondo para las filas
    if (index % 2 === 0) {
      doc.setFillColor(243, 244, 246); // bg-gray-100
      doc.rect(14, yPosition - 5, 180, 10, 'F');
    }
    
    // Dibujar datos
    doc.text(`${index + 1}`, colPositions[0], yPosition, { align: 'left' });
    doc.text(candidate.name.substring(0, 25), colPositions[1], yPosition, { align: 'left' });
    doc.text(`${Math.round(candidate.score)}%`, colPositions[2], yPosition, { align: 'left' });
    doc.text(`${candidate.experience} años`, colPositions[3], yPosition, { align: 'left' });
    doc.text(candidate.suggestedRole.substring(0, 15), colPositions[4], yPosition, { align: 'left' });
    doc.text(candidate.seniority || 'No especificado', colPositions[5], yPosition, { align: 'left' });
    
    // Añadir habilidades si hay habilidades requeridas y la columna existe
    if (requiredSkills.length > 0 && colPositions.length > 6) {
      const skills = candidate.matchedSkills.filter(skill => 
        requiredSkills.includes(skill)
      ).join(', ');
      
      const skillText = skills ? skills.substring(0, 18) + (skills.length > 18 ? '...' : '') : 'N/A';
      doc.text(skillText, colPositions[6], yPosition, { align: 'left' });
    }
    
    yPosition += 10;
  });
  
  // Añadir sección de detalles
  yPosition += 10;
  doc.setFontSize(subtitleFontSize);
  doc.setTextColor(79, 70, 229); // text-indigo-600
  doc.text('Detalles de Candidatos', 14, yPosition, { align: 'left' });
  yPosition += 10;
  
  // Iterar sobre cada candidato para añadir sus detalles
  candidates.forEach((candidate, index) => {
    // Verificar si necesitamos una nueva página
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Añadir separador
    doc.setDrawColor(229, 231, 235); // border-gray-200
    doc.line(14, yPosition - 5, 196, yPosition - 5);
    
    // Añadir ranking y nombre del candidato
    doc.setFontSize(subtitleFontSize);
    doc.setTextColor(79, 70, 229); // text-indigo-600
    doc.text(`${index + 1}. ${candidate.name}`, 14, yPosition, { align: 'left' });
    yPosition += 8;
    
    // Añadir puntuación y rol sugerido
    doc.setFontSize(normalFontSize);
    doc.setTextColor(75, 85, 99); // text-gray-600
    doc.text(`Puntuación: ${Math.round(candidate.score)}% | Rol Sugerido: ${candidate.suggestedRole} | Seniority: ${candidate.seniority || 'No especificado'}`, 14, yPosition, { align: 'left' });
    yPosition += 8;
    
    // Añadir experiencia y educación
    doc.setFontSize(normalFontSize);
    doc.setTextColor(75, 85, 99); // text-gray-600
    doc.text(`Experiencia: ${candidate.experience} años | Educación: ${candidate.education}`, 14, yPosition, { align: 'left' });
    yPosition += 10;
    
    // Añadir resumen de experiencia
    if (candidate.experienceSummary) {
      doc.setFontSize(normalFontSize);
      doc.setTextColor(79, 70, 229); // text-indigo-600
      doc.text('Resumen de Experiencia:', 14, yPosition, { align: 'left' });
      yPosition += 6;
      
      doc.setTextColor(75, 85, 99); // text-gray-600
      
      // Dividir el texto en líneas para que quepa en la página
      const experienceLines = doc.splitTextToSize(candidate.experienceSummary, 180);
      doc.text(experienceLines, 14, yPosition, { align: 'left' });
      yPosition += experienceLines.length * 5 + 5;
    }
    
    // Añadir resumen de educación
    if (candidate.educationSummary) {
      // Verificar si necesitamos una nueva página
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(normalFontSize);
      doc.setTextColor(79, 70, 229); // text-indigo-600
      doc.text('Formación y Certificaciones:', 14, yPosition, { align: 'left' });
      yPosition += 6;
      
      doc.setTextColor(75, 85, 99); // text-gray-600
      
      // Dividir el texto en líneas para que quepa en la página
      const educationLines = doc.splitTextToSize(candidate.educationSummary, 180);
      doc.text(educationLines, 14, yPosition, { align: 'left' });
      yPosition += educationLines.length * 5 + 5;
    }
    
    // Añadir habilidades destacadas
    if (candidate.matchedSkills.length > 0) {
      // Verificar si necesitamos una nueva página
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(normalFontSize);
      doc.setTextColor(79, 70, 229); // text-indigo-600
      doc.text('Habilidades Destacadas:', 14, yPosition, { align: 'left' });
      yPosition += 6;
      
      doc.setTextColor(75, 85, 99); // text-gray-600
      
      // Dividir las habilidades en grupos para que quepan en la página
      const skillsText = candidate.matchedSkills.join(', ');
      const skillsLines = doc.splitTextToSize(skillsText, 180);
      doc.text(skillsLines, 14, yPosition, { align: 'left' });
      yPosition += skillsLines.length * 5 + 5;
    }
    
    // Añadir otras habilidades
    if (candidate.otherSkills) {
      // Verificar si necesitamos una nueva página
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(normalFontSize);
      doc.setTextColor(79, 70, 229); // text-indigo-600
      doc.text('Otras Habilidades:', 14, yPosition);
      yPosition += 6;
      
      doc.setTextColor(75, 85, 99); // text-gray-600
      
      // Dividir el texto en líneas para que quepa en la página
      const otherSkillsLines = doc.splitTextToSize(candidate.otherSkills, 180);
      doc.text(otherSkillsLines, 14, yPosition);
      yPosition += otherSkillsLines.length * 5 + 10;
    }
  });
  
  // Añadir pie de página
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(smallFontSize);
    doc.setTextColor(156, 163, 175); // text-gray-400
    doc.text(`Página ${i} de ${totalPages} | Generado por CV Profile Ranker`, 14, 285);
  }
  
  // Guardar el PDF
  doc.save(`candidatos_evaluacion_${new Date().toISOString().split('T')[0]}.pdf`);
};
