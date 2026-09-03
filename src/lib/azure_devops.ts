import { AzureResources } from '@/types';

export async function checkAzureWebServiceHealth(url: string): Promise<{
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  statusCode: number;
  latencyMs: number;
}> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const latencyMs = Date.now() - start;

    if (res.status >= 200 && res.status < 400) {
      return { status: 'HEALTHY', statusCode: res.status, latencyMs };
    } else {
      return { status: 'DEGRADED', statusCode: res.status, latencyMs };
    }
  } catch (e: any) {
    return {
      status: 'UNHEALTHY',
      statusCode: 500,
      latencyMs: Date.now() - start
    };
  }
}

export function parseAzureDevOpsRepoUrl(repoUrl?: string): {
  org?: string;
  project?: string;
  repo?: string;
} {
  if (!repoUrl) return {};

  try {
    // Soporta formato: https://dev.azure.com/ORGANIZACION/PROYECTO/_git/REPOSITORIO
    const match = repoUrl.match(/dev\.azure\.com\/([^/]+)\/([^/]+)\/_git\/([^/]+)/);
    if (match) {
      return {
        org: match[1],
        project: match[2],
        repo: match[3]
      };
    }
  } catch (e) {
    // fallback
  }

  return {};
}
