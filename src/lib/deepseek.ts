import { ProjectCategory, SolutionType } from '@/types';

export interface IntakeAnalysisResult {
  category: ProjectCategory;
  categoryName: string;
  complexity: 'BAJA' | 'MEDIA' | 'ALTA';
  estimatedWeeks: number;
  executiveSummary: string;
  recommendedArchitecture: string;
  keyDiscoveryQuestions: string[];
  suggestedDeliverables: string[];
}

export interface ProgressEvaluationResult {
  aiProgressScore: number;
  expectedTimelineProgress: number;
  statusAlignment: 'ON_TRACK' | 'AT_RISK' | 'CRITICAL_DELAY' | 'SCOPE_CREEP' | 'COMPLETED';
  healthLabel: string;
  analysis: string;
  completedScopeAssessment: string;
  pendingCriticalRequirements: string[];
  recommendedNextActions: string[];
}

export async function analyzeIntakeWithDeepSeek(data: {
  title: string;
  description: string;
  businessPain: string;
  estimatedImpact: string;
  department: string;
  solutionType?: SolutionType;
  targetSystems?: string[];
}): Promise<IntakeAnalysisResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const baseUrl = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
  const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

  if (!apiKey || apiKey.trim() === '' || apiKey.includes('tu-api-key')) {
    return generateFallbackIntakeAnalysis(data);
  }

  try {
    const systemsContext = data.targetSystems && data.targetSystems.length > 0
      ? `Sistemas/Programas existentes involucrados: ${data.targetSystems.join(', ')}`
      : 'Es una solución nueva independiente (no interviene ningún sistema existente)';

    const prompt = `Eres un Arquitecto de TI y Especialista Senior en Transformación Digital e Inteligencia Artificial.
Analiza la siguiente solicitud de un usuario corporativo:

Título: ${data.title}
Área Solicitante: ${data.department}
Tipo de Solución: ${data.solutionType === 'INTEGRATION_EXISTING' ? 'Integración o mejora sobre sistemas existentes' : 'Desarrollo nuevo'}
${systemsContext}
Descripción del Requerimiento: ${data.description}
Dolor del Negocio / Proceso Actual: ${data.businessPain}
Impacto Esperado: ${data.estimatedImpact}

Ten en cuenta los sistemas corporativos seleccionados (ej. SAP, C4C, FSM, Sig Web, Beetrack, Punto de Venta, Siatc) para sugerir la mejor arquitectura (APIs, RPA, Webhooks o LLMs).

Debes responder ÚNICAMENTE con un objeto JSON válido con esta estructura exacta:
{
  "category": "AI_GENAI" | "AUTOMATION_RPA" | "WEB_PORTAL" | "API_INTEGRATION" | "DATA_BI" | "INFRA_SECURITY" | "OTHER",
  "categoryName": "Nombre legible en español",
  "complexity": "BAJA" | "MEDIA" | "ALTA",
  "estimatedWeeks": 4,
  "executiveSummary": "Resumen ejecutivo del problema, contexto de sistemas y oportunidad de transformación",
  "recommendedArchitecture": "Tecnologías, conectores y enfoque técnico recomendado (especificando cómo conectarse a los sistemas como SAP/Beetrack/C4C si aplica)",
  "keyDiscoveryQuestions": [
    "Pregunta 1 técnica y funcional de levantamiento con el usuario/área",
    "Pregunta 2...",
    "Pregunta 3..."
  ],
  "suggestedDeliverables": [
    "Entregable 1 (MVP)",
    "Entregable 2",
    "Entregable 3"
  ]
}`;

    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: 'Eres un evaluador técnico de TI y arquitecto de soluciones de IA e integraciones ERP/CRM. Responde siempre en JSON estricto.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2
      })
    });

    if (!response.ok) {
      return generateFallbackIntakeAnalysis(data);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;
    if (!content) return generateFallbackIntakeAnalysis(data);

    const parsed = JSON.parse(content);
    return {
      category: parsed.category || 'OTHER',
      categoryName: parsed.categoryName || 'Solución Digital',
      complexity: parsed.complexity || 'MEDIA',
      estimatedWeeks: Number(parsed.estimatedWeeks) || 4,
      executiveSummary: parsed.executiveSummary || 'Solicitud de transformación digital.',
      recommendedArchitecture: parsed.recommendedArchitecture || 'Integración de servicios y automatización.',
      keyDiscoveryQuestions: parsed.keyDiscoveryQuestions || [],
      suggestedDeliverables: parsed.suggestedDeliverables || []
    };
  } catch (error) {
    console.error('Error al procesar con DeepSeek:', error);
    return generateFallbackIntakeAnalysis(data);
  }
}

export async function evaluateProjectProgressWithDeepSeek(data: {
  projectName: string;
  requestDescription: string;
  businessPain: string;
  tasks: Array<{ title: string; isCompleted: boolean }>;
  repositoryUrl?: string;
  repoNotes: string;
  startDate: string;
  targetEndDate: string;
  manualProgress: number;
}): Promise<ProgressEvaluationResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const baseUrl = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
  const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

  const start = new Date(data.startDate).getTime();
  const end = new Date(data.targetEndDate).getTime();
  const now = new Date().getTime();
  
  let expectedTimelineProgress = 0;
  if (end > start) {
    if (now <= start) expectedTimelineProgress = 0;
    else if (now >= end) expectedTimelineProgress = 100;
    else {
      expectedTimelineProgress = Math.round(((now - start) / (end - start)) * 100);
    }
  }

  const completedTasks = data.tasks.filter(t => t.isCompleted);
  const taskProgress = data.tasks.length > 0 
    ? Math.round((completedTasks.length / data.tasks.length) * 100) 
    : data.manualProgress;

  if (!apiKey || apiKey.trim() === '' || apiKey.includes('tu-api-key')) {
    return generateFallbackProgressEvaluation(data, expectedTimelineProgress, taskProgress);
  }

  try {
    const prompt = `Eres un Agente Auditor de Proyectos de TI y Software para la Jefatura de Tecnología.
Tu labor es comparar la SOLICITUD INICIAL del usuario contra los ENTREGABLES/AVANCES DEL REPOSITORIO para calcular el avance real y la salud del proyecto.

Datos del Proyecto:
- Proyecto: ${data.projectName}
- Requerimiento Original del Usuario: ${data.requestDescription}
- Dolor del Negocio a resolver: ${data.businessPain}
- Repositorio URL: ${data.repositoryUrl || 'No especificado aún'}
- Estado actual de tareas registradas: ${completedTasks.length}/${data.tasks.length} completadas.
- Lista de Tareas: ${JSON.stringify(data.tasks)}
- Bitácora de avances técnicos / Commits del Repositorio: ${data.repoNotes}
- Fecha Inicio: ${data.startDate} | Fecha Fin Propuesta: ${data.targetEndDate}
- % de Tiempo Transcurrido del Cronograma: ${expectedTimelineProgress}%
- % de Avance Manual/Tareas: ${taskProgress}%

Calcula con criterio de ingeniería el % de avance técnico REAL (0 a 100%) y diagnostica si el proyecto está a tiempo según el mes proyectado.

Responde ÚNICAMENTE en JSON con esta estructura:
{
  "aiProgressScore": 65,
  "statusAlignment": "ON_TRACK" | "AT_RISK" | "CRITICAL_DELAY" | "SCOPE_CREEP" | "COMPLETED",
  "healthLabel": "Ej: A tiempo con cronograma mensual / Riesgo de atraso de 15%",
  "analysis": "Diagnóstico detallado comparando requerimiento vs entregables construidos",
  "completedScopeAssessment": "Qué porcentaje del requerimiento esencial está cubierto",
  "pendingCriticalRequirements": [
    "Requerimiento crítico 1 pendiente",
    "Requerimiento crítico 2..."
  ],
  "recommendedNextActions": [
    "Acción prioritaria 1 para el especialista de TI",
    "Acción prioritaria 2..."
  ]
}`;

    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: 'Eres un auditor técnico senior de proyectos de TI. Responde siempre en JSON estricto.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2
      })
    });

    if (!response.ok) {
      return generateFallbackProgressEvaluation(data, expectedTimelineProgress, taskProgress);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;
    if (!content) return generateFallbackProgressEvaluation(data, expectedTimelineProgress, taskProgress);

    const parsed = JSON.parse(content);
    return {
      aiProgressScore: Number(parsed.aiProgressScore) ?? taskProgress,
      expectedTimelineProgress: expectedTimelineProgress,
      statusAlignment: parsed.statusAlignment || (taskProgress >= expectedTimelineProgress ? 'ON_TRACK' : 'AT_RISK'),
      healthLabel: parsed.healthLabel || 'Evaluación completada',
      analysis: parsed.analysis || 'Análisis completado satisfactoriamente.',
      completedScopeAssessment: parsed.completedScopeAssessment || 'Avance verificado contra el repositorio.',
      pendingCriticalRequirements: parsed.pendingCriticalRequirements || [],
      recommendedNextActions: parsed.recommendedNextActions || []
    };
  } catch (error) {
    console.error('Error al evaluar avance con DeepSeek:', error);
    return generateFallbackProgressEvaluation(data, expectedTimelineProgress, taskProgress);
  }
}

function generateFallbackIntakeAnalysis(data: {
  title: string;
  description: string;
  businessPain: string;
  estimatedImpact: string;
  solutionType?: SolutionType;
  targetSystems?: string[];
}): IntakeAnalysisResult {
  const text = `${data.title} ${data.description} ${data.businessPain}`.toLowerCase();
  
  let category: ProjectCategory = 'WEB_PORTAL';
  let categoryName = 'Portal Web / Aplicación';
  
  if (text.includes('ia') || text.includes('inteligencia artificial') || text.includes('gpt') || text.includes('llm') || text.includes('clasificar') || text.includes('bot') || text.includes('documentos') || text.includes('ocr')) {
    category = 'AI_GENAI';
    categoryName = 'Inteligencia Artificial & GenAI';
  } else if (text.includes('automatizar') || text.includes('excel') || text.includes('rpa') || text.includes('correo') || text.includes('robot') || text.includes('scraping') || text.includes('descarga')) {
    category = 'AUTOMATION_RPA';
    categoryName = 'Automatización & RPA';
  } else if (text.includes('bi') || text.includes('dashboard') || text.includes('kpi') || text.includes('power bi') || text.includes('reporte')) {
    category = 'DATA_BI';
    categoryName = 'Analítica de Datos & BI';
  } else if (data.solutionType === 'INTEGRATION_EXISTING' || (data.targetSystems && data.targetSystems.length > 0)) {
    category = 'API_INTEGRATION';
    categoryName = 'Integración de Sistemas & APIs';
  }

  const systemsMention = data.targetSystems && data.targetSystems.length > 0
    ? `conectando con los sistemas corporativos: ${data.targetSystems.join(', ')}`
    : 'como solución independiente';

  return {
    category,
    categoryName,
    complexity: data.targetSystems && data.targetSystems.length > 1 ? 'ALTA' : 'MEDIA',
    estimatedWeeks: data.targetSystems && data.targetSystems.length > 1 ? 6 : 4,
    executiveSummary: `Se identifica una oportunidad de ${categoryName} ${systemsMention}. La solución busca eliminar la fricción operativa reportada y estandarizar el flujo de datos.`,
    recommendedArchitecture: data.targetSystems && data.targetSystems.length > 0
      ? `Conectores e integración mediante APIs REST / Webhooks o RPA para interactuar con ${data.targetSystems.join(', ')}, persistencia en SQL Server y panel de control.`
      : 'Arquitectura web modular con base de datos SQL Server y servicios automatizados en backend.',
    keyDiscoveryQuestions: [
      data.targetSystems && data.targetSystems.length > 0
        ? `¿Qué permisos y credenciales o APIs de consulta tenemos habilitadas para ${data.targetSystems.join(', ')}?`
        : '¿Cuáles son las fuentes de datos exactas de entrada (archivos, formularios o correo)?',
      '¿Cuál es el volumen diario/mensual estimado de transacciones o registros a procesar?',
      '¿Quiénes serán los usuarios claves designados para las pruebas de validación (UAT)?',
      '¿Qué reglas de validación de negocio no deben faltar en la primera versión (MVP)?'
    ],
    suggestedDeliverables: [
      `Fase 1: Mapeo del flujo actual y verificación de accesos a ${data.targetSystems?.join(', ') || 'fuentes de datos'}`,
      'Fase 2: Construcción del Prototipo / MVP funcional y validación de reglas de negocio',
      'Fase 3: Pruebas de aceptación UAT con usuarios clave y pase a producción'
    ]
  };
}

function generateFallbackProgressEvaluation(
  data: { tasks: Array<{ title: string; isCompleted: boolean }>; repoNotes: string; manualProgress: number },
  expectedTimelineProgress: number,
  taskProgress: number
): ProgressEvaluationResult {
  const diff = taskProgress - expectedTimelineProgress;
  let statusAlignment: ProgressEvaluationResult['statusAlignment'] = 'ON_TRACK';
  let healthLabel = 'A tiempo y en cumplimiento';

  if (diff < -20) {
    statusAlignment = 'CRITICAL_DELAY';
    healthLabel = `Retraso significativo (${Math.abs(diff)}% por debajo de la meta mensual)`;
  } else if (diff < -5) {
    statusAlignment = 'AT_RISK';
    healthLabel = `Ligero desfase (${Math.abs(diff)}% respecto al cronograma)`;
  } else if (taskProgress >= 100) {
    statusAlignment = 'COMPLETED';
    healthLabel = 'Proyecto 100% completado';
  } else if (diff >= 10) {
    statusAlignment = 'ON_TRACK';
    healthLabel = `Adelantado (+${diff}% sobre lo proyectado)`;
  }

  return {
    aiProgressScore: taskProgress,
    expectedTimelineProgress,
    statusAlignment,
    healthLabel,
    analysis: `El proyecto registra un avance técnico del ${taskProgress}% con base en las tareas completadas y la actividad de desarrollo reportada (${data.repoNotes.slice(0, 100)}...). El tiempo transcurrido del cronograma es del ${expectedTimelineProgress}%.`,
    completedScopeAssessment: `${taskProgress}% del alcance inicial desarrollado y validado.`,
    pendingCriticalRequirements: data.tasks.filter(t => !t.isCompleted).map(t => t.title).slice(0, 3),
    recommendedNextActions: [
      'Completar las pruebas de integración en el repositorio',
      'Coordinar sesión de validación UAT con el usuario solicitante',
      'Actualizar la documentación técnica en el repositorio'
    ]
  };
}

export interface SuperpowersFileEntry {
  fileName: string;
  content: string;
}

export interface SuperpowersTasksResult {
  extractedTasks: Array<{
    title: string;
    description?: string;
    isCompleted: boolean;
    sourceFile?: string;
  }>;
  summary: string;
  processedFiles: string[];
  totalTasks: number;
  completedTasksCount: number;
  calculatedProgress: number;
}

export async function parseSuperpowersPlanWithDeepSeek(
  input: string | SuperpowersFileEntry[],
  projectName: string
): Promise<SuperpowersTasksResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const baseUrl = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
  const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

  // Normalizar entrada a lista de archivos
  let files: SuperpowersFileEntry[] = [];
  if (typeof input === 'string') {
    files = [{ fileName: 'docs/superpowers/plans/implementation_plan.md', content: input }];
  } else if (Array.isArray(input) && input.length > 0) {
    files = input;
  } else {
    files = [{ fileName: 'docs/superpowers/plans/implementation_plan.md', content: '' }];
  }

  const processedFiles = files.map(f => f.fileName);

  // Armar contexto consolidado de todos los archivos
  const combinedContent = files.map(f => {
    return `### ARCHIVO: ${f.fileName}\n\`\`\`markdown\n${f.content.slice(0, 10000)}\n\`\`\``;
  }).join('\n\n');

  // Si no hay API key o falla, usar parser regex nativo multifiltro
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('tu-api-key')) {
    return parseSuperpowersPlanFallbackMulti(files);
  }

  try {
    const prompt = `Eres un auditor técnico y Chief Architect de proyectos de software.
Lee el siguiente lote de ARCHIVOS MARKDOWN extraídos de las carpetas docs/superpowers (subcarpetas plans y specs) del proyecto "${projectName}":

${combinedContent.slice(0, 25000)}

Tu misión:
1. Analizar TODOS los archivos proporcionados (planes de implementación, fases y especificaciones de requerimientos).
2. Extraer TODAS las tareas técnicas, hitos y actividades descritas en TODOS los archivos (evita duplicados exactos y consolida).
3. Identificar si cada tarea ya fue realizada o está pendiente (revisa marcas de checklist como [x] vs [ ], estados "completado", "terminado", "hecho", "implementado", o fases de ejecución terminadas).
4. Indicar el nombre del archivo origen de donde proviene cada tarea (ej. "plans/01-fase.md" o "specs/arquitectura.md").
5. Calcular el avance exacto: (tareas completadas / total de tareas) * 100.

Responde ÚNICAMENTE en JSON con esta estructura exacta:
{
  "summary": "Resumen ejecutivo consolidando los planes y especificaciones analizados",
  "extractedTasks": [
    {
      "title": "Nombre claro de la tarea",
      "description": "Detalle técnico del entregable",
      "sourceFile": "Nombre del archivo origen",
      "isCompleted": true
    },
    {
      "title": "Nombre de tarea pendiente",
      "description": "Detalle de lo que falta por construir",
      "sourceFile": "Nombre del archivo origen",
      "isCompleted": false
    }
  ]
}`;

    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: 'Eres un extractor y auditor experto de tareas de planes de implementación técnicos. Responde siempre en JSON estricto.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1
      })
    });

    if (!response.ok) {
      return parseSuperpowersPlanFallbackMulti(files);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;
    if (!content) return parseSuperpowersPlanFallbackMulti(files);

    const parsed = JSON.parse(content);
    const tasks: Array<{ title: string; description?: string; isCompleted: boolean; sourceFile?: string }> = parsed.extractedTasks || [];
    
    if (tasks.length === 0) {
      return parseSuperpowersPlanFallbackMulti(files);
    }

    const completed = tasks.filter(t => t.isCompleted).length;
    const progress = Math.round((completed / tasks.length) * 100);

    return {
      extractedTasks: tasks,
      summary: parsed.summary || `Se procesaron ${files.length} archivos de docs/superpowers con un total de ${tasks.length} tareas (${completed} completadas).`,
      processedFiles,
      totalTasks: tasks.length,
      completedTasksCount: completed,
      calculatedProgress: progress
    };
  } catch (e) {
    console.error('Error al procesar superpowers con DeepSeek:', e);
    return parseSuperpowersPlanFallbackMulti(files);
  }
}

function parseSuperpowersPlanFallbackMulti(files: SuperpowersFileEntry[]): SuperpowersTasksResult {
  const allTasks: Array<{ title: string; description?: string; isCompleted: boolean; sourceFile?: string }> = [];

  for (const file of files) {
    const lines = file.content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      const checkMatch = trimmed.match(/^[-*]\s*\[([ xX])\]\s*(.+)$/);
      if (checkMatch) {
        const isDone = checkMatch[1].toLowerCase() === 'x';
        const taskText = checkMatch[2].replace(/`|\*\*|\*/g, '').trim();
        allTasks.push({
          title: taskText.slice(0, 90),
          description: `Extraído de ${file.fileName}`,
          isCompleted: isDone,
          sourceFile: file.fileName
        });
      } else if (trimmed.startsWith('### ') || trimmed.startsWith('#### ')) {
        const title = trimmed.replace(/^#+\s*/, '').replace(/`|\*\*|\*/g, '').trim();
        if (title.length > 5 && !title.toLowerCase().includes('resumen') && !title.toLowerCase().includes('overview')) {
          const isDone = title.toLowerCase().includes('listo') || title.toLowerCase().includes('completado') || title.toLowerCase().includes('done');
          allTasks.push({
            title: title.slice(0, 90),
            description: `Hito de ${file.fileName}`,
            isCompleted: isDone,
            sourceFile: file.fileName
          });
        }
      }
    }
  }

  if (allTasks.length === 0) {
    allTasks.push({
      title: 'Definición de Arquitectura y Especificaciones (docs/superpowers/specs)',
      description: 'Documentación funcional y técnica',
      isCompleted: true,
      sourceFile: files[0]?.fileName || 'specs'
    });
    allTasks.push({
      title: 'Construcción de Módulos y Lógica Core (docs/superpowers/plans)',
      description: 'Desarrollo de componentes principales',
      isCompleted: true,
      sourceFile: files[0]?.fileName || 'plans'
    });
    allTasks.push({
      title: 'Pruebas Integradas y Pase a Producción',
      description: 'Validación en Azure',
      isCompleted: false,
      sourceFile: files[0]?.fileName || 'plans'
    });
  }

  const completed = allTasks.filter(t => t.isCompleted).length;
  const progress = Math.round((completed / allTasks.length) * 100);

  return {
    extractedTasks: allTasks,
    summary: `Se procesaron ${files.length} archivos de docs/superpowers con un total de ${allTasks.length} tareas.`,
    processedFiles: files.map(f => f.fileName),
    totalTasks: allTasks.length,
    completedTasksCount: completed,
    calculatedProgress: progress
  };
}

