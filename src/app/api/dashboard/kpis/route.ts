import { NextResponse } from 'next/server';
import { ProjectStore } from '@/lib/store';

export async function GET() {
  try {
    const kpis = ProjectStore.getExecutiveKPIs();
    const projects = ProjectStore.getProjects();
    
    // Proyectos con sus datos de Gantt mensual calculados
    const projectsWithGantt = projects.map(p => ({
      ...p,
      gantt: ProjectStore.calculateMonthlyGanttForProject(p)
    }));

    return NextResponse.json({
      success: true,
      data: {
        kpis,
        projects: projectsWithGantt
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
