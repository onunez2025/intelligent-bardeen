import { NextResponse } from 'next/server';
import { getMicrosoftAuthUrl } from '@/lib/microsoft_auth';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000';
  let protocol = req.headers.get('x-forwarded-proto') || (url.protocol.replace(':', '') || 'http');
  
  // Forzar HTTPS en producción y dominios remotos
  if (host.includes('easypanel.host') || host.includes('azurewebsites.net') || host.includes('.com') || host.includes('.pe')) {
    protocol = 'https';
  }

  const baseUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || `${protocol}://${host}`;
  const redirectUri = `${baseUrl}/api/auth/callback/azure-ad`;

  const authUrl = getMicrosoftAuthUrl(redirectUri);

  if (!authUrl) {
    return NextResponse.json({
      success: false,
      isConfigured: false,
      message: 'Las variables AZURE_AD_CLIENT_ID y AZURE_AD_CLIENT_SECRET aún no están configuradas en el entorno.',
      instructions: 'Para activar el inicio de sesión real con Microsoft 365, registra la App en Azure Portal (Entra ID) y agrega las variables.'
    }, { status: 200 });
  }

  return NextResponse.redirect(authUrl);
}
