import { NextResponse } from 'next/server';
import { ProjectStore } from '@/lib/store';
import { checkAzureWebServiceHealth } from '@/lib/azure_devops';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = ProjectStore.getProjectById(id);
    if (!project) {
      return NextResponse.json({ success: false, error: 'Proyecto no encontrado' }, { status: 404 });
    }

    const targetUrl = project.deploymentUrl || project.azureResources?.webAppUrl;
    if (!targetUrl) {
      return NextResponse.json({ 
        success: false, 
        error: 'El proyecto no tiene configurada una URL de Azure Web App' 
      }, { status: 400 });
    }

    const health = await checkAzureWebServiceHealth(targetUrl);

    // Actualizar estado de salud en el proyecto
    ProjectStore.updateProject(project.id, {
      azureResources: {
        ...project.azureResources,
        healthStatus: health.status,
        lastHealthCheck: new Date().toISOString()
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        url: targetUrl,
        ...health,
        checkedAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
