import { NextResponse } from 'next/server';
import { getMicrosoftAuthUrl } from '@/lib/microsoft_auth';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000';
  const protocol = req.headers.get('x-forwarded-proto') || (url.protocol.replace(':', '') || 'http');
  const redirectUri = `${protocol}://${host}/api/auth/callback/azure-ad`;

  const authUrl = getMicrosoftAuthUrl(redirectUri);

  if (!authUrl) {
    // Si no está configurado Azure AD en variables de entorno, responder con info de configuración
    return NextResponse.json({
      success: false,
      isConfigured: false,
      message: 'Las variables AZURE_AD_CLIENT_ID y AZURE_AD_CLIENT_SECRET aún no están configuradas en el entorno.',
      instructions: 'Para activar el inicio de sesión real con Microsoft 365, registra la App en Azure Portal (Entra ID) y agrega las variables.'
    }, { status: 200 });
  }

  return NextResponse.redirect(authUrl);
}
