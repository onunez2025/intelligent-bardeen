/**
 * Utilidades para Autenticación Corporativa Microsoft 365 / Microsoft Entra ID (Azure AD)
 * Soporta OAuth 2.0 / OpenID Connect institucional para Grupo Sole (Corporación Rinnai).
 */

export interface MicrosoftOAuthTokens {
  access_token: string;
  id_token?: string;
  token_type: string;
  expires_in: number;
}

export interface MicrosoftUserProfile {
  id: string;
  displayName: string;
  givenName?: string;
  surname?: string;
  mail?: string;
  userPrincipalName: string;
  jobTitle?: string;
  department?: string;
}

export function getMicrosoftAuthUrl(redirectUri: string): string | null {
  const clientId = process.env.AZURE_AD_CLIENT_ID;
  const tenantId = process.env.AZURE_AD_TENANT_ID || 'common';

  if (!clientId || clientId.trim() === '' || clientId.includes('tu-client-id')) {
    return null; // Variables no configuradas aún
  }

  const scope = encodeURIComponent('openid profile email User.Read');
  const responseType = 'code';
  const responseMode = 'query';

  return `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=${responseType}&redirect_uri=${encodeURIComponent(redirectUri)}&response_mode=${responseMode}&scope=${scope}`;
}

export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string
): Promise<MicrosoftOAuthTokens | null> {
  const clientId = process.env.AZURE_AD_CLIENT_ID;
  const clientSecret = process.env.AZURE_AD_CLIENT_SECRET;
  const tenantId = process.env.AZURE_AD_TENANT_ID || 'common';

  if (!clientId || !clientSecret) {
    throw new Error('Faltan configurar AZURE_AD_CLIENT_ID o AZURE_AD_CLIENT_SECRET');
  }

  const tokenEndpoint = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

  const params = new URLSearchParams();
  params.append('client_id', clientId);
  params.append('scope', 'openid profile email User.Read');
  params.append('code', code);
  params.append('redirect_uri', redirectUri);
  params.append('grant_type', 'authorization_code');
  params.append('client_secret', clientSecret);

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('Error al intercambiar token con Microsoft:', errText);
    throw new Error(`Fallo de autenticación con Microsoft Entra ID: ${errText}`);
  }

  return response.json();
}

export async function getMicrosoftUserProfile(accessToken: string): Promise<MicrosoftUserProfile> {
  const response = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error('No se pudo obtener el perfil de Microsoft Graph');
  }

  return response.json();
}
