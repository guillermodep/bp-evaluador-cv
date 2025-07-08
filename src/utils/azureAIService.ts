import { Candidate } from './evaluationUtils';
import * as mammoth from 'mammoth';
// Importar pdfjs-dist para procesar archivos PDF
import * as pdfjsLib from 'pdfjs-dist';
import configurePdfWorker from './pdfWorkerConfig';

// Configurar el worker de PDF.js
configurePdfWorker();

// Configuración de Azure OpenAI con variables de entorno de Vite
const AZURE_OPENAI_KEY = import.meta.env.VITE_AZURE_OPENAI_KEY || "";
const AZURE_OPENAI_ENDPOINT = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT || "";
const AZURE_OPENAI_DEPLOYMENT = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT || "gpt-4.1-nano-2";
const API_VERSION = import.meta.env.VITE_AZURE_API_VERSION || "2025-01-01-preview";

// Verificar que las variables de entorno estén configuradas
if (!AZURE_OPENAI_KEY || !AZURE_OPENAI_ENDPOINT) {
  console.error('Error: Variables de entorno de Azure OpenAI no configuradas correctamente.');
}

// Función para extraer texto de archivos Word (.doc y .docx)
const extractTextFromWord = async (file: File): Promise<string> => {
  try {
    console.log('Extrayendo texto de archivo Word:', file.name);
    
    // Leer el archivo como ArrayBuffer
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as ArrayBuffer);
        } else {
          reject(new Error('No se pudo leer el contenido del archivo Word'));
        }
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo Word'));
      reader.readAsArrayBuffer(file);
    });
    
    let text = '';
    
    // Método 1: Intentar extraer texto con mammoth (mejor para .docx)
    try {
      console.log('Intentando extraer texto con mammoth...');
      const result = await mammoth.extractRawText({ arrayBuffer });
      text = result.value || '';
      console.log(`Texto extraído con mammoth (longitud: ${text.length})`);
    } catch (mammothError) {
      console.error('Error al extraer texto con mammoth:', mammothError);
    }
    
    // Si mammoth no funcionó, intentar con método alternativo
    if (!text || text.trim().length < 50) {
      console.log('Texto insuficiente con mammoth, intentando método alternativo...');
      
      // Método 2: Extraer texto buscando patrones en el archivo binario
      try {
        const decoder = new TextDecoder('utf-8');
        let rawText = decoder.decode(arrayBuffer);
        
        // Buscar patrones de texto en el archivo binario
        const textMatches = rawText.match(/[\w\s\.,;:!\?\-\(\)\[\]\{\}@#$%&*+='"áéíóúÁÉÍÓÚñÑ]{5,}/g) || [];
        const extractedText = textMatches.join(' ');
        
        if (extractedText && extractedText.length > text.length) {
          text = extractedText;
          console.log(`Texto extraído con método alternativo (longitud: ${text.length})`);
        }
      } catch (alternativeError) {
        console.error('Error al extraer texto con método alternativo:', alternativeError);
      }
    }
    
    // Método 3: Si los métodos anteriores fallaron, extraer texto del nombre del archivo
    if (!text || text.trim().length < 50) {
      console.log('No se pudo extraer texto suficiente, generando texto a partir del nombre del archivo');
      const fileName = file.name.split('.')[0].replace(/_/g, ' ');
      text = `CV de ${fileName}. No se pudo extraer el contenido del archivo. Por favor, intenta con un formato diferente o asegúrate de que el archivo no esté protegido o dañado.`;
    }
    
    console.log(`Texto final extraído (primeros 200 caracteres): ${text.substring(0, 200)}...`);
    console.log(`Longitud total del texto extraído: ${text.length} caracteres`);
    
    return text;
  } catch (error) {
    console.error('Error al extraer texto del archivo Word:', error);
    throw error;
  }
};

// Función para extraer texto de archivos PDF usando pdfjs-dist
const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    console.log('Extrayendo texto de archivo PDF:', file.name);
    
    // Leer el archivo como ArrayBuffer
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as ArrayBuffer);
        } else {
          reject(new Error('No se pudo leer el contenido del archivo PDF'));
        }
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo PDF'));
      reader.readAsArrayBuffer(file);
    });
    
    try {
      // Cargar el documento PDF con pdfjs-dist
      const typedArray = new Uint8Array(arrayBuffer);
      const loadingTask = pdfjsLib.getDocument({ data: typedArray });
      
      // Establecer un timeout para la carga del PDF para evitar que se quede bloqueado
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Tiempo de espera agotado al cargar el PDF')), 10000);
      });
      
      // Esperar a que se cargue el PDF o se agote el tiempo de espera
      const pdf = await Promise.race([
        loadingTask.promise,
        timeoutPromise
      ]) as pdfjsLib.PDFDocumentProxy;
      
      console.log(`PDF cargado correctamente. Número de páginas: ${pdf.numPages}`);
      
      // Extraer texto de todas las páginas
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        try {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          
          fullText += pageText + '\n';
        } catch (pageError) {
          console.warn(`Error al extraer texto de la página ${i}:`, pageError);
          // Continuar con la siguiente página
          continue;
        }
      }
      
      console.log(`Texto extraído del PDF (longitud: ${fullText.length})`);
      console.log(`Texto extraído (primeros 200 caracteres): ${fullText.substring(0, 200)}...`);
      
      if (!fullText || fullText.trim().length < 50) {
        throw new Error('Texto insuficiente extraído del PDF');
      }
      
      return fullText;
    } catch (pdfError) {
      // Capturar errores específicos de PDF.js
      console.error('Error al procesar el PDF:', pdfError);
      
      // Generar un texto a partir del nombre del archivo para permitir que el proceso continúe
      const fileName = file.name.split('.')[0].replace(/_/g, ' ');
      return `CV de ${fileName}. [ARCHIVO NO PROCESADO] No se pudo extraer texto del archivo PDF debido a problemas con su estructura. Este archivo será omitido del análisis detallado.`;
    }
  } catch (error) {
    console.error('Error general al extraer texto del archivo PDF:', error);
    
    // En lugar de lanzar un error, devolver un mensaje que permita continuar el proceso
    const fileName = file.name.split('.')[0].replace(/_/g, ' ');
    return `CV de ${fileName}. [ARCHIVO NO PROCESADO] Error al procesar el archivo: ${error.message}. Este archivo será omitido del análisis detallado.`;
  }
};

// Función principal para extraer texto de archivos (DOC/DOCX/PDF)
export const extractTextFromFile = async (file: File): Promise<string> => {
  // Verificar si es un archivo Word o PDF
  const isPDF = file.name.endsWith('.pdf') || file.type === 'application/pdf';
  const isWord = file.name.endsWith('.doc') || file.name.endsWith('.docx') || 
                file.type === 'application/msword' || 
                file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  
  if (!isPDF && !isWord) {
    throw new Error(`Tipo de archivo no soportado: ${file.type}. Por favor, sube archivos en formato DOC, DOCX o PDF.`);
  }
  
  console.log(`Procesando archivo: ${file.name}, tipo: ${file.type}, tamaño: ${file.size} bytes`);
  
  try {
    let text = '';
    
    // Procesar archivo según su tipo
    if (isPDF) {
      text = await extractTextFromPDF(file);
    } else if (isWord) {
      text = await extractTextFromWord(file);
    }
    
    if (!text || text.trim().length === 0) {
      throw new Error(`No se pudo extraer texto del archivo ${file.name}. El archivo puede estar protegido o dañado.`);
    }
    
    console.log(`Texto extraído exitosamente de ${file.name}, longitud: ${text.length} caracteres`);
    return text;
  } catch (error) {
    console.error(`Error al procesar el archivo ${file.name}:`, error);
    throw new Error(`Error al procesar el archivo ${file.name}: ${error.message}. Por favor, inténtalo con otro archivo.`);
  }
};

// Función para limpiar y preparar el texto del CV para análisis
const prepareTextForAnalysis = (text: string): string => {
  // Eliminar caracteres especiales y espacios extras
  let cleanedText = text
    .replace(/\s+/g, ' ')         // Reemplazar múltiples espacios con uno solo
    .replace(/[\r\n]+/g, '\n')    // Normalizar saltos de línea
    .trim();                     // Eliminar espacios al inicio y final
  
  // El modelo gpt-4.1-nano puede manejar hasta 128K tokens, así que podemos enviar el texto completo
  // Solo registramos la longitud para depuración
  console.log(`Longitud del texto preparado: ${cleanedText.length} caracteres`);
  
  // No limitamos la longitud para asegurarnos de que se procese todo el CV
  return cleanedText;
};

// Función para evaluar un CV usando Azure OpenAI con el modelo gpt-4.1-nano-2
export const evaluateCV = async (cvText: string, fileName: string): Promise<Candidate> => {
  // Verificar que las variables de entorno estén configuradas
  if (!AZURE_OPENAI_KEY || !AZURE_OPENAI_ENDPOINT) {
    console.error('Error: Variables de entorno de Azure OpenAI no configuradas correctamente.');
    // Devolver un candidato con error si las variables no están configuradas
    return {
      name: fileName.split('.')[0].replace(/_/g, ' '),
      score: 0,
      experience: 0,
      education: "Error de Configuración",
      experienceSummary: 'Error: Variables de entorno de Azure OpenAI no configuradas.',
      educationSummary: "Error de Configuración",
      otherSkills: "Error de Configuración",
      matchedSkills: [],
      missingSkills: [],
      suggestedRole: "Error de Configuración",
      seniority: "Error de Configuración",
      fileName: fileName,
      suggestionReasoning: 'No se pudo procesar debido a un error de configuración del servicio de IA.',
    };
  }

  // Limpiar y preparar el texto del CV
  const cleanedText = prepareTextForAnalysis(cvText);

  // Prompt para Azure OpenAI
  const systemMessage = `
    Eres un asistente experto en reclutamiento de TI. Analiza el siguiente CV y devuelve la información en formato JSON.
    El JSON debe tener la siguiente estructura:
    {
      "name": "Nombre del candidato (si se encuentra, sino 'Candidato Anónimo')",
      "experience": "Años totales de experiencia relevantes en TI (número)",
      "education": "Nivel educativo más alto o título principal (ej: 'Ingeniería en Sistemas', 'Licenciatura en Informática', 'Técnico Superior')",
      "experienceSummary": "Un resumen conciso de la experiencia laboral del candidato (máximo 150 palabras).",
      "educationSummary": "Un resumen de la formación académica y certificaciones relevantes (máximo 100 palabras).",
      "matchedSkills": ["Lista de hasta 10 habilidades clave encontradas que coincidan con roles de TI comunes, como lenguajes de programación, frameworks, herramientas DevOps, BBDD, etc."],
      "otherSkills": "Otras habilidades o conocimientos mencionados que puedan ser relevantes (texto libre, máximo 70 palabras).",
      "suggestedRole": "El rol de TI más adecuado para este candidato basado en su experiencia y habilidades (ej: 'Desarrollador Frontend', 'Ingeniero DevOps', 'Analista de Datos', 'Ingeniero QA').",
      "seniority": "Nivel de seniority estimado (ej: 'Junior', 'Semi-Senior', 'Senior', 'Lead', 'Architect').",
      "suggestionReasoning": "Una breve explicación (1-2 frases concisas, máximo 50 palabras) de por qué el rol y seniority sugeridos son adecuados, basándote en el CV."
    }
    Si alguna información no se puede determinar claramente, usa "No especificado" o un valor razonable por defecto (ej. 0 para experiencia).
    Prioriza la extracción de datos concretos del CV. No inventes información.
    El nombre del candidato suele estar al principio del CV. Intenta identificarlo.
  `;

  const userMessage = `Analiza el siguiente texto de CV y extrae la información solicitada en formato JSON:

--- CV TEXT --- 
${cleanedText}
--- END CV TEXT ---`;

  const requestBody = {
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: userMessage },
    ],
    max_tokens: 1000, // Aumentado ligeramente por el nuevo campo
    temperature: 0.2, // Mantener baja para respuestas más factuales
    response_format: { type: "json_object" },
  };

  try {
    const response = await fetch(`${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${API_VERSION}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': AZURE_OPENAI_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Error en la API de Azure: ${response.status} ${response.statusText}`, errorBody);
      throw new Error(`Error en la API de Azure: ${response.status} ${response.statusText}. Detalles: ${errorBody}`);
    }

    const data = await response.json();
    
    // Verificar si la respuesta contiene la estructura esperada
    if (!data.choices || data.choices.length === 0 || !data.choices[0].message || !data.choices[0].message.content) {
      console.error('Respuesta inesperada de Azure AI:', data);
      throw new Error('Respuesta inesperada o vacía de Azure AI.');
    }
    
    const rawJson = data.choices[0].message.content;
    let parsedData;
    try {
      parsedData = JSON.parse(rawJson);
    } catch (jsonError) {
      console.error('Error al parsear JSON de Azure AI:', jsonError);
      console.error('JSON recibido:', rawJson);
      throw new Error('Error al interpretar la respuesta de Azure AI. Formato JSON inválido.');
    }

    // Calcular un score simple basado en la completitud y relevancia (simulado)
    let score = 50; // Base score
    if (parsedData.experience && parsedData.experience > 0) score += 10;
    if (parsedData.education && parsedData.education !== "No especificado") score += 5;
    if (parsedData.matchedSkills && parsedData.matchedSkills.length > 0) score += parsedData.matchedSkills.length * 2;
    if (parsedData.suggestedRole && parsedData.suggestedRole !== "No especificado") score += 10;
    score = Math.min(score, 95); // Cap score at 95 for some variability
    if (parsedData.experienceSummary && parsedData.experienceSummary.toLowerCase().includes('error')) {
      score = Math.max(0, score - 30); // Penalizar si hay error en el resumen
    }
    if (cvText.includes('[ARCHIVO NO PROCESADO]')) {
      score = 0; // Si el texto ya indica un error de procesamiento, el score es 0.
    }

    return {
      name: parsedData.name || fileName.split('.')[0].replace(/_/g, ' '),
      score: score,
      experience: typeof parsedData.experience === 'number' ? parsedData.experience : 0,
      education: parsedData.education || 'No especificado',
      experienceSummary: parsedData.experienceSummary || 'No se pudo extraer el resumen de experiencia.',
      educationSummary: parsedData.educationSummary || 'No se pudo extraer el resumen de educación.',
      matchedSkills: Array.isArray(parsedData.matchedSkills) ? parsedData.matchedSkills : [],
      missingSkills: [], // Placeholder, not implemented yet
      otherSkills: parsedData.otherSkills || 'No especificado',
      suggestedRole: parsedData.suggestedRole || 'No determinado',
      seniority: parsedData.seniority || 'No determinado',
      fileName: fileName,
      suggestionReasoning: parsedData.suggestionReasoning || 'No se proporcionó razonamiento.', // Nuevo campo
    };

  } catch (error) {
    console.error(`Error al evaluar el CV ${fileName}:`, error);
    return {
      name: fileName.split('.')[0].replace(/_/g, ' '),
      score: 0, // Score bajo en caso de error
      experience: 0,
      education: "Error de procesamiento",
      experienceSummary: `[ARCHIVO NO PROCESADO] Error al evaluar el CV: ${error.message}. Este archivo no pudo ser analizado correctamente.`,
      educationSummary: "No disponible",
      otherSkills: "No disponible",
      matchedSkills: [],
      missingSkills: [],
      suggestedRole: "Error",
      seniority: "Error",
      fileName: fileName,
      suggestionReasoning: 'Error durante el análisis con IA.', // Razonamiento en caso de error
    };
  }
};

// Importar el tipo ProgressUpdateFunction desde evaluationUtils
import { ProgressUpdateFunction } from './evaluationUtils';

// Función principal para evaluar múltiples CVs
export const evaluateCVsWithAzure = async (files: File[], onProgressUpdate?: ProgressUpdateFunction): Promise<Candidate[]> => {
  console.log(`Evaluando ${files.length} CVs con Azure OpenAI...`);
  
  // Array para almacenar los resultados exitosos y los errores
  const results: { success: boolean; result: Candidate | Error; fileName: string }[] = [];
  
  // Procesar cada archivo y obtener su texto
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    try {
      console.log(`Procesando archivo ${i+1}/${files.length}: ${file.name}`);
      
      // Actualizar el progreso si se proporcionó la función de actualización
      if (onProgressUpdate) {
        onProgressUpdate(i, files.length, file.name); // <-- Pasar file.name aquí
      }
      
      let text: string;
      
      try {
        text = await extractTextFromFile(file);
        console.log(`Texto extraído exitosamente de ${file.name}, longitud: ${text.length} caracteres`);
      } catch (extractError) {
        console.error(`Error al extraer texto de ${file.name}:`, extractError);
        
        // Verificar si el texto contiene el marcador de archivo no procesado
        if (extractError instanceof Error && extractError.message.includes('[ARCHIVO NO PROCESADO]')) {
          // Usar el mensaje de error como texto para continuar con una evaluación básica
          text = extractError.message;
        } else {
          // Crear un texto genérico para continuar con el proceso
          const fileName = file.name.split('.')[0].replace(/_/g, ' ');
          text = `CV de ${fileName}. [ARCHIVO NO PROCESADO] Error al extraer texto: ${extractError.message}. Este archivo será omitido del análisis detallado.`;
        }
      }
      
      // Evaluar el CV con Azure OpenAI (incluso si es un archivo no procesado)
      try {
        const evaluation = await evaluateCV(text, file.name);
        results.push({ success: true, result: evaluation, fileName: file.name });
        console.log(`Evaluación exitosa para ${file.name}`);
      } catch (evaluateError) {
        console.error(`Error al evaluar ${file.name}:`, evaluateError);
        
        // Crear un candidato con información mínima para mostrar en la interfaz
        const fileName = file.name.split('.')[0].replace(/_/g, ' ');
        const errorCandidate: Candidate = {
          name: fileName,
          score: 0,
          experience: 0,
          education: "No procesado",
          experienceSummary: `[ARCHIVO NO PROCESADO] Error al evaluar el CV: ${evaluateError.message}. Este archivo no pudo ser analizado correctamente.`,
          educationSummary: "No disponible",
          otherSkills: "No disponible",
          matchedSkills: [],
          missingSkills: [],
          suggestedRole: "No determinado",
          seniority: "No determinado",
          fileName: file.name
        };
        
        results.push({ success: true, result: errorCandidate, fileName: file.name });
      }
      
      // Actualizar el progreso después de completar el procesamiento del archivo
      if (onProgressUpdate) {
        onProgressUpdate(i + 1, files.length, file.name); // <-- Pasar file.name aquí
      }
      
    } catch (fileError) {
      console.error(`Error general al procesar ${file.name}:`, fileError);
      results.push({ success: false, result: fileError as Error, fileName: file.name });
      
      // Actualizar el progreso incluso en caso de error
      if (onProgressUpdate) {
        onProgressUpdate(i + 1, files.length, file.name); // <-- Pasar file.name aquí
      }
    }
  }
  
  // Filtrar solo los resultados exitosos y convertirlos a Candidate[]
  const successfulEvaluations = results
    .filter(item => item.success)
    .map(item => item.result as Candidate);
  
  // Registrar estadísticas de procesamiento
  const failedFiles = results.filter(item => !item.success).map(item => item.fileName);
  console.log(`Procesamiento completado: ${successfulEvaluations.length} archivos procesados, ${failedFiles.length} archivos fallidos`);
  
  if (failedFiles.length > 0) {
    console.log(`Archivos que no pudieron ser procesados: ${failedFiles.join(', ')}`);
  }
  
  // Si no hay evaluaciones exitosas, lanzar un error
  if (successfulEvaluations.length === 0) {
    throw new Error(`No se pudo procesar ninguno de los ${files.length} archivos. Por favor, verifica el formato de los archivos e inténtalo de nuevo.`);
  }
  
  // Actualizar el progreso al 100% al finalizar
  if (onProgressUpdate) {
    onProgressUpdate(files.length, files.length, files[files.length - 1].name); // <-- Pasar file.name aquí
  }
  
  return successfulEvaluations;
};
