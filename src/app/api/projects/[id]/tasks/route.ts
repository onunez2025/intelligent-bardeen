import { NextResponse } from 'next/server';
import { ProjectStore } from '@/lib/store';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const project = ProjectStore.getProjectById(id);
    if (!project) {
      return NextResponse.json({ success: false, error: 'Proyecto no encontrado' }, { status: 404 });
    }

    const body = await req.json();
    const { action, taskId, title, isCompleted } = body;

    let updatedTasks = [...project.tasks];

    if (action === 'TOGGLE' && taskId) {
      updatedTasks = updatedTasks.map(t => 
        t.id === taskId ? { ...t, isCompleted: isCompleted !== undefined ? isCompleted : !t.isCompleted } : t
      );
    } else if (action === 'DELETE' && taskId) {
      updatedTasks = updatedTasks.filter(t => t.id !== taskId);
    } else if (title) {
      const newTask = {
        id: `t-${Date.now()}`,
        projectId: project.id,
        title,
        isCompleted: false,
        order: updatedTasks.length + 1,
        createdAt: new Date().toISOString()
      };
      updatedTasks.push(newTask);
    }

    // Recalcular manualProgress con base en tareas
    const completedCount = updatedTasks.filter(t => t.isCompleted).length;
    const manualProgress = updatedTasks.length > 0 ? Math.round((completedCount / updatedTasks.length) * 100) : project.manualProgress;

    const updated = ProjectStore.updateProject(project.id, {
      tasks: updatedTasks,
      manualProgress
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
