import { NextResponse } from 'next/server';
import { ProjectStore } from '@/lib/store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const eventType = body.eventType; // 'git.push', 'build.complete', 'release.deployment.completed'

    console.log(`\n🪝 [AZURE DEVOPS WEBHOOK RECIBIDO: ${eventType}]`);

    // 1. Evento: Push de Código (git.push)
    if (eventType === 'git.push') {
      const repoName = body.resource?.repository?.name;
      const commits = body.resource?.commits || [];
      const pusher = body.resource?.pushedBy?.displayName || 'Desarrollador TI';
      const lastCommit = commits[0] || {};

      const projects = ProjectStore.getProjects();
      const matched = projects.find(p => 
        p.repositoryUrl?.toLowerCase().includes(repoName?.toLowerCase()) ||
        p.code.toLowerCase().includes(repoName?.toLowerCase())
      );

      if (matched) {
        ProjectStore.updateProject(matched.id, {
          azureResources: {
            ...matched.azureResources,
            devOpsRepo: repoName,
            lastCommit: {
              message: lastCommit.comment || 'Actualización de código en Azure Repos',
              author: pusher,
              date: new Date().toISOString(),
              sha: lastCommit.commitId?.slice(0, 7) || 'HEAD'
            }
          },
          notes: [
            ...(matched.notes || []),
            {
              id: `note-push-${Date.now()}`,
              projectId: matched.id,
              title: `Commit en Azure DevOps por ${pusher}`,
              content: `Mensaje: ${lastCommit.comment || 'Push a rama main'}\nCommit ID: ${lastCommit.commitId || 'N/A'}`,
              author: 'Azure DevOps CI/CD',
              createdAt: new Date().toISOString()
            }
          ]
        });

        console.log(`Proyecto actualizado por Azure DevOps Webhook: ${matched.code}`);
      }
    }

    // 2. Evento: Despliegue de Azure Web App (release.deployment.completed o build.complete)
    if (eventType === 'release.deployment.completed' || eventType === 'build.complete') {
      const status = body.resource?.status; // 'succeeded' / 'failed'
      const repoName = body.resource?.repository?.name || body.resource?.definition?.name;

      const projects = ProjectStore.getProjects();
      const matched = projects.find(p => 
        p.repositoryUrl?.toLowerCase().includes(repoName?.toLowerCase()) ||
        p.name.toLowerCase().includes(repoName?.toLowerCase())
      );

      if (matched && status === 'succeeded') {
        ProjectStore.updateProject(matched.id, {
          status: 'DEPLOYED',
          manualProgress: 100,
          azureResources: {
            ...matched.azureResources,
            pipelineStatus: 'SUCCEEDED'
          }
        });
        console.log(`Proyecto marcado como DEPLOYED por Azure DevOps: ${matched.code}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Azure DevOps webhook procesado exitosamente',
      receivedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error procesando webhook de Azure DevOps:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
