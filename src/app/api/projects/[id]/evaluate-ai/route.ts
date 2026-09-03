import { NextResponse } from 'next/server';
import { ProjectStore } from '@/lib/store';
import { evaluateProjectProgressWithDeepSeek } from '@/lib/deepseek';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const project = ProjectStore.getProjectById(id);
    if (!project) {
      return NextResponse.json({ success: false, error: 'Proyecto no encontrado' }, { status: 404 });
    }

    const body = await req.json();
    const repoNotes = body.repoNotes || 'Actualización periódica de desarrollo y commits del repositorio.';

    // Ejecutar agente de IA DeepSeek
    const evaluation = await evaluateProjectProgressWithDeepSeek({
      projectName: project.name,
      requestDescription: project.description,
      businessPain: project.roiSummary || project.description,
      tasks: project.tasks.map(t => ({ title: t.title, isCompleted: t.isCompleted })),
      repositoryUrl: project.repositoryUrl,
      repoNotes: repoNotes,
      startDate: project.startDate,
      targetEndDate: project.targetEndDate,
      manualProgress: project.manualProgress
    });

    // Guardar nuevo log de avance
    const newLog = {
      id: `log-${Date.now()}`,
      projectId: project.id,
      repoNotes: repoNotes,
      aiProgressScore: evaluation.aiProgressScore,
      aiFeedback: evaluation.analysis,
      createdAt: new Date().toISOString()
    };

    const updatedLogs = [newLog, ...(project.progressLogs || [])];

    // Actualizar proyecto con el nuevo porcentaje estimado y análisis
    const updated = ProjectStore.updateProject(project.id, {
      aiEstimatedProgress: evaluation.aiProgressScore,
      aiProgressAnalysis: `${evaluation.healthLabel}: ${evaluation.analysis}`,
      lastAiEvaluationAt: new Date().toISOString(),
      progressLogs: updatedLogs
    });

    return NextResponse.json({
      success: true,
      evaluation,
      project: updated
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
