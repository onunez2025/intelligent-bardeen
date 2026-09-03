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
    const { title, content, author } = body;

    const newNote = {
      id: `note-${Date.now()}`,
      projectId: project.id,
      title: title || 'Nota de Reunión / Discovery',
      content: content || '',
      author: author || 'Especialista TI',
      createdAt: new Date().toISOString()
    };

    const updatedNotes = [newNote, ...(project.notes || [])];

    const updated = ProjectStore.updateProject(project.id, {
      notes: updatedNotes
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
