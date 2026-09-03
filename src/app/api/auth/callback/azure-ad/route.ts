import { NextResponse } from 'next/server';
import { exchangeCodeForTokens, getMicrosoftUserProfile } from '@/lib/microsoft_auth';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    if (error) {
      return NextResponse.redirect(`${url.origin}/?auth_error=${encodeURIComponent(errorDescription || error)}`);
    }

    if (!code) {
      return NextResponse.redirect(`${url.origin}/?auth_error=No_code_provided`);
    }

    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || (url.protocol.replace(':', '') || 'http');
    const redirectUri = `${protocol}://${host}/api/auth/callback/azure-ad`;

    // Intercambiar código por Token
    const tokens = await exchangeCodeForTokens(code, redirectUri);
    if (!tokens || !tokens.access_token) {
      return NextResponse.redirect(`${url.origin}/?auth_error=Token_exchange_failed`);
    }

    // Obtener Perfil del Usuario desde Microsoft Graph
    const profile = await getMicrosoftUserProfile(tokens.access_token);
    
    const userEmail = (profile.mail || profile.userPrincipalName || '').toLowerCase();
    const userName = profile.displayName || profile.givenName || 'Usuario M365';
    const userDept = profile.department || profile.jobTitle || 'Corporativo';

    // Determinar rol (Si es TI o Administrador)
    const isSpecialist = userEmail.includes('onunez') || 
                         userEmail.includes('admin') || 
                         userDept.toLowerCase().includes('ti') || 
                         userDept.toLowerCase().includes('tecnología') ||
                         userDept.toLowerCase().includes('transformación');

    const initials = userName
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'M3';

    const authUser = {
      id: `usr-m365-${profile.id || Date.now()}`,
      name: userName,
      email: userEmail,
      department: userDept,
      role: isSpecialist ? 'IT_SPECIALIST' : 'USER',
      avatarInitials: initials
    };

    // Renderizar página de redirección con persistencia en localStorage
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Autenticando con Microsoft 365...</title>
          <style>
            body { background: #0f111a; color: white; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { text-align: center; }
            .spinner { border: 3px solid rgba(255,255,255,0.1); border-top: 3px solid #0073ea; border-radius: 50%; width: 36px; height: 36px; animation: spin 1s linear infinite; margin: 0 auto 16px; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="spinner"></div>
            <h3>Sesión iniciada con éxito</h3>
            <p style="color: #94a3b8; font-size: 13px;">Redirigiendo a TI Innovation Portal...</p>
          </div>
          <script>
            try {
              localStorage.setItem('ti_innovation_auth_user', JSON.stringify(${JSON.stringify(authUser)}));
              window.location.href = '/';
            } catch (e) {
              window.location.href = '/';
            }
          </script>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });

  } catch (err: any) {
    console.error('Error en callback de Azure AD:', err);
    return NextResponse.redirect(`${new URL(req.url).origin}/?auth_error=${encodeURIComponent(err.message)}`);
  }
}
