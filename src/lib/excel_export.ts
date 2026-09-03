import * as XLSX from 'xlsx';
import { Project } from '@/types';

export function exportProjectsToExcel(projects: Project[], customFilename?: string) {
  const wb = XLSX.utils.book_new();

  // Hoja 1: Resumen del Portafolio
  const projectsData = projects.map(p => {
    const actualProgress = p.aiEstimatedProgress ?? p.manualProgress;
    const moneySavedMonth = p.savedMoneyMonth || ((p.savedHoursMonth || 0) * (p.hourlyRate || 18));
    const annualImpact = (moneySavedMonth * 12) + (p.directCostSavingsYear || 0);

    const statusLabels: Record<string, string> = {
      DEPLOYED: 'Listo / Producción',
      IN_PROGRESS: 'Trabajando en ello',
      UAT_TESTING: 'Pruebas UAT',
      DISCOVERY: 'Discovery / Levantamiento',
      BACKLOG: 'Por Iniciar',
      CANCELLED: 'Pausado / Cancelado'
    };

    const categoryLabels: Record<string, string> = {
      AI_GENAI: 'Inteligencia Artificial & LLM',
      AUTOMATION_RPA: 'Automatización & RPA',
      WEB_PORTAL: 'Portales & Apps Web',
      DATA_BI: 'Power BI & Analítica',
      API_INTEGRATION: 'Integración de APIs',
      OTHER: 'Otro Desarrollo'
    };

    return {
      'Código': p.code,
      'Nombre del Proyecto': p.name,
      'Estado': statusLabels[p.status] || p.status,
      'Categoría': categoryLabels[p.category] || p.category,
      'Tipo de Solución': p.solutionType === 'INTEGRATION_EXISTING' ? 'Integración a Sistema Existente' : 'Solución Nueva',
      'Sistemas Corporativos': p.targetSystems && p.targetSystems.length > 0 ? p.targetSystems.join(', ') : 'Ninguno (Nueva)',
      'Área Solicitante': p.requesterDepartment,
      'Usuario Solicitante': p.requesterName,
      'Correo Solicitante': p.requesterEmail,
      'Responsable Técnico': p.specialistName || 'Orlando Núñez',
      'Fecha Inicio': p.startDate,
      'Fecha Fin Target': p.targetEndDate,
      'Avance Real (%)': `${actualProgress}%`,
      'Ahorro Mensual ($)': moneySavedMonth,
      'Horas Ahorradas / Mes': p.savedHoursMonth || 0,
      'Costo Hora ($/hr)': p.hourlyRate || 18,
      'Impacto Anual Proyectado ($)': annualImpact,
      'Horas Estimadas Desarrollo': p.estimatedHours || 0,
      'Horas Reales Invertidas': p.actualHours || 0,
      'Repositorio Código': p.repositoryUrl || 'Sin repositorio',
      'Resumen ROI': p.roiSummary || ''
    };
  });

  const wsProjects = XLSX.utils.json_to_sheet(projectsData);
  XLSX.utils.book_append_sheet(wb, wsProjects, 'Portafolio de Proyectos');

  // Hoja 2: Desglose de Tareas / Entregables MVP
  const tasksData: any[] = [];
  projects.forEach(p => {
    if (p.tasks && p.tasks.length > 0) {
      p.tasks.forEach((t, idx) => {
        tasksData.push({
          'Código Proyecto': p.code,
          'Proyecto': p.name,
          'N°': idx + 1,
          'Entregable / Tarea': t.title,
          'Estado': t.isCompleted ? 'Completado' : 'Pendiente',
          'Fecha Registro': t.createdAt ? t.createdAt.split('T')[0] : ''
        });
      });
    }
  });

  if (tasksData.length > 0) {
    const wsTasks = XLSX.utils.json_to_sheet(tasksData);
    XLSX.utils.book_append_sheet(wb, wsTasks, 'Plan de Tareas MVP');
  }

  // Hoja 3: Minutas y Notas de Discovery
  const notesData: any[] = [];
  projects.forEach(p => {
    if (p.notes && p.notes.length > 0) {
      p.notes.forEach(n => {
        notesData.push({
          'Código Proyecto': p.code,
          'Proyecto': p.name,
          'Título de Minuta': n.title,
          'Autor': n.author,
          'Fecha': n.createdAt ? n.createdAt.split('T')[0] : '',
          'Contenido / Acuerdos': n.content
        });
      });
    }
  });

  if (notesData.length > 0) {
    const wsNotes = XLSX.utils.json_to_sheet(notesData);
    XLSX.utils.book_append_sheet(wb, wsNotes, 'Minutas y Discovery');
  }

  // Generar y descargar archivo
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = customFilename || `Reporte_Portafolio_TI_${dateStr}.xlsx`;
  XLSX.writeFile(wb, filename);
}

export function exportSingleProjectToExcel(project: Project) {
  const wb = XLSX.utils.book_new();
  const actualProgress = project.aiEstimatedProgress ?? project.manualProgress;
  const moneySavedMonth = project.savedMoneyMonth || ((project.savedHoursMonth || 0) * (project.hourlyRate || 18));
  const annualImpact = (moneySavedMonth * 12) + (project.directCostSavingsYear || 0);

  // Ficha General
  const generalInfo = [
    { 'Campo': 'Código Único', 'Valor': project.code },
    { 'Campo': 'Nombre del Proyecto', 'Valor': project.name },
    { 'Campo': 'Descripción', 'Valor': project.description },
    { 'Campo': 'Estado Actual', 'Valor': project.status },
    { 'Campo': 'Categoría Tecnológica', 'Valor': project.category },
    { 'Campo': 'Tipo de Solución', 'Valor': project.solutionType === 'INTEGRATION_EXISTING' ? 'Integración a Sistema Existente' : 'Solución Nueva' },
    { 'Campo': 'Sistemas Integrados', 'Valor': project.targetSystems?.join(', ') || 'Ninguno' },
    { 'Campo': 'Área Solicitante', 'Valor': project.requesterDepartment },
    { 'Campo': 'Solicitante', 'Valor': `${project.requesterName} (${project.requesterEmail})` },
    { 'Campo': 'Responsable Técnico TI', 'Valor': project.specialistName || 'Orlando Núñez' },
    { 'Campo': 'Fecha de Inicio', 'Valor': project.startDate },
    { 'Campo': 'Fecha Fin Planificada', 'Valor': project.targetEndDate },
    { 'Campo': 'Avance Real', 'Valor': `${actualProgress}%` },
    { 'Campo': 'Ahorro Mensual Estimado', 'Valor': `$${moneySavedMonth.toLocaleString()} / mes` },
    { 'Campo': 'Horas Operativas Liberadas', 'Valor': `${project.savedHoursMonth || 0} horas/mes` },
    { 'Campo': 'Impacto Económico Anual', 'Valor': `$${annualImpact.toLocaleString()} / año` },
    { 'Campo': 'Repositorio Git', 'Valor': project.repositoryUrl || 'No configurado' },
    { 'Campo': 'Documentación Técnica', 'Valor': project.documentationUrl || 'No configurada' },
    { 'Campo': 'Auditoría DeepSeek AI', 'Valor': project.aiProgressAnalysis || 'Sin evaluación registrada' }
  ];

  const wsGeneral = XLSX.utils.json_to_sheet(generalInfo);
  XLSX.utils.book_append_sheet(wb, wsGeneral, 'Ficha del Proyecto');

  // Tareas
  if (project.tasks && project.tasks.length > 0) {
    const tasksData = project.tasks.map((t, idx) => ({
      'N°': idx + 1,
      'Tarea / Hito': t.title,
      'Estado': t.isCompleted ? 'Listo' : 'Pendiente',
      'Fecha': t.createdAt ? t.createdAt.split('T')[0] : ''
    }));
    const wsTasks = XLSX.utils.json_to_sheet(tasksData);
    XLSX.utils.book_append_sheet(wb, wsTasks, 'Tareas y Entregables');
  }

  // Minutas
  if (project.notes && project.notes.length > 0) {
    const notesData = project.notes.map(n => ({
      'Título': n.title,
      'Autor': n.author,
      'Fecha': n.createdAt ? n.createdAt.split('T')[0] : '',
      'Detalle': n.content
    }));
    const wsNotes = XLSX.utils.json_to_sheet(notesData);
    XLSX.utils.book_append_sheet(wb, wsNotes, 'Minutas y Acuerdos');
  }

  const filename = `Ficha_Proyecto_${project.code}_${project.name.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`;
  XLSX.writeFile(wb, filename);
}
