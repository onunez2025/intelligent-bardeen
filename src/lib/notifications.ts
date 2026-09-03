import { UserRequest, Project } from '@/types';

export interface EmailNotificationPayload {
  to: string;
  subject: string;
  recipientName: string;
  template: 'REQUEST_RECEIVED' | 'REQUEST_CONVERTED' | 'PROJECT_STATUS_UPDATE';
  data: {
    code: string;
    title: string;
    status?: string;
    actionUrl?: string;
    specialistName?: string;
    notes?: string;
  };
}

export async function sendCorporateNotification(payload: EmailNotificationPayload) {
  // En producción, este servicio se conecta a Microsoft Graph API o SMTP de Microsoft 365
  console.log(`\n📧 [NOTIFICACIÓN M365 ENVIADA A: ${payload.to}]`);
  console.log(`Asunto: ${payload.subject}`);
  console.log(`Plantilla: ${payload.template}`);
  console.log(`Detalle: ${payload.data.code} - ${payload.data.title}`);
  
  return {
    success: true,
    sentAt: new Date().toISOString(),
    recipient: payload.to,
    messageId: `msg-${Date.now()}`
  };
}
