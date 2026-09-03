import { NextResponse } from 'next/server';
import { ProjectStore } from '@/lib/store';
import { parseSuperpowersPlanWithDeepSeek, SuperpowersFileEntry } from '@/lib/deepseek';

export async function POST(
  req: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = ProjectStore.getProjectById(id);
    if (!project) {
      return NextResponse.json({ success: false, error: 'Proyecto no encontrado' }, { status: 404 });
    }

    const body = await req.json();
    const files: SuperpowersFileEntry[] = body.files || [];
    const markdownContent = body.markdownContent;
    const sourceFileName = body.sourceFileName || 'docs/superpowers';

    let inputToProcess: string | SuperpowersFileEntry[] = [];

    if (files.length > 0) {
      inputToProcess = files;
    } else if (markdownContent && markdownContent.trim() !== '') {
      inputToProcess = [{ fileName: sourceFileName, content: markdownContent }];
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'No se enviaron archivos o contenido markdown para procesar' 
      }, { status: 400 });
    }

    // Procesar con DeepSeek cruzando todos los archivos de plans y specs
    const result = await parseSuperpowersPlanWithDeepSeek(inputToProcess, project.name);

    // Mapear a tareas formales
    const newTasks = result.extractedTasks.map((t, idx) => ({
      id: `task-sp-${Date.now()}-${idx}`,
      projectId: project.id,
      title: t.title,
      description: t.description ? `${t.description} (Origen: ${t.sourceFile || 'docs/superpowers'})` : `Origen: ${t.sourceFile || 'docs/superpowers'}`,
      isCompleted: t.isCompleted,
      order: idx + 1,
      createdAt: new Date().toISOString()
    }));

    const fileNamesList = result.processedFiles?.join(', ') || sourceFileName;

    // Registrar bitácora y nota
    const newNote = {
      id: `note-sp-${Date.now()}`,
      projectId: project.id,
      title: `Sincronización Multi-Archivo: ${result.processedFiles?.length || 1} doc(s) de docs/superpowers`,
      content: `DeepSeek AI analizó los siguientes documentos de plans y specs:\n• ${fileNamesList}\n\nSe extrajeron ${result.totalTasks} tareas (${result.completedTasksCount} completadas).\nAvance Calculado: ${result.calculatedProgress}%\n\nResumen del Auditor: ${result.summary}`,
      author: 'DeepSeek AI (Superpowers Engine)',
      createdAt: new Date().toISOString()
    };

    const newLog = {
      id: `log-sp-${Date.now()}`,
      projectId: project.id,
      repoNotes: `Sincronización desde: ${fileNamesList}`,
      aiProgressScore: result.calculatedProgress,
      aiFeedback: result.summary,
      createdAt: new Date().toISOString()
    };

    // Actualizar proyecto en memoria y en Azure SQL Server
    const updated = ProjectStore.updateProject(project.id, {
      tasks: newTasks,
      manualProgress: result.calculatedProgress,
      aiEstimatedProgress: result.calculatedProgress,
      aiProgressAnalysis: `Superpowers (${result.processedFiles?.length || 1} docs): ${result.summary}`,
      lastAiEvaluationAt: new Date().toISOString(),
      notes: [newNote, ...(project.notes || [])],
      progressLogs: [newLog, ...(project.progressLogs || [])]
    });

    return NextResponse.json({
      success: true,
      data: {
        summary: result.summary,
        processedFiles: result.processedFiles,
        totalTasks: result.totalTasks,
        completedTasksCount: result.completedTasksCount,
        calculatedProgress: result.calculatedProgress,
        tasks: newTasks,
        project: updated
      }
    });
  } catch (error: any) {
    console.error('Error al sincronizar con docs/superpowers:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
